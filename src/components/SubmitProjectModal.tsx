import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, type Category, type Subcategory } from '../lib/category-utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Link as LinkIcon, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

// Context for managing modal state
interface SubmitProjectModalContextType {
  open: boolean;
  setOpen: (open: boolean, initialValues?: { categoryId?: string; subcategoryName?: string; lockCategory?: boolean }) => void;
  initialValues: { categoryId?: string; subcategoryName?: string };
  lockCategory: boolean;
}

const SubmitProjectModalContext = createContext<SubmitProjectModalContextType | undefined>(undefined);

export function useSubmitProjectModal() {
  const context = useContext(SubmitProjectModalContext);
  if (!context) {
    throw new Error('useSubmitProjectModal must be used within SubmitProjectModalProvider');
  }
  return context;
}

// Provider component
export function SubmitProjectModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<{ categoryId?: string; subcategoryName?: string }>({});
  const [lockCategory, setLockCategory] = useState(false);

  const handleSetOpen = (isOpen: boolean, values?: { categoryId?: string; subcategoryName?: string; lockCategory?: boolean }) => {
    setOpen(isOpen);
    if (isOpen && values) {
      setInitialValues({ categoryId: values.categoryId, subcategoryName: values.subcategoryName });
      setLockCategory(values.lockCategory || false);
    } else if (!isOpen) {
      setInitialValues({});
      setLockCategory(false);
    }
  };

  return (
    <SubmitProjectModalContext.Provider value={{ open, setOpen: handleSetOpen, initialValues, lockCategory }}>
      {children}
      <SubmitProjectModalContent />
    </SubmitProjectModalContext.Provider>
  );
}

// Modal content component
function SubmitProjectModalContent() {
  const { open, setOpen, initialValues, lockCategory } = useSubmitProjectModal();
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [initialValuesApplied, setInitialValuesApplied] = useState(false);
  
  // New category/subcategory dialogs
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newSubcategoryDialog, setNewSubcategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  interface ProjectFormData {
    name: string;
    location: string;
    description: string;
    founded?: string;
    raised?: string;
    website?: string;
    twitter?: string;
    github?: string;
    logo?: string;
    categoryId: string;
    subcategoryName: string;
    thirdLevelName?: string;
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>();

  const watchCategoryId = watch('categoryId');
  const watchSubcategoryName = watch('subcategoryName');
  const watchLogoUrl = watch('logo');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setLogoPreview('');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setInitialValuesApplied(false);
    }
  }, [open, reset]);

  // Update categoryData when categories are loaded
  useEffect(() => {
    if (categories) {
      setCategoryData(categories);
    }
  }, [categories]);

  // Update logo preview when URL changes
  useEffect(() => {
    if (watchLogoUrl) {
      setLogoPreview(watchLogoUrl);
    }
  }, [watchLogoUrl]);

  // Set initial values when modal opens with initial values (only once)
  useEffect(() => {
    if (open && initialValues.categoryId && !initialValuesApplied) {
      // Use categoryData if available, otherwise use categories directly
      const dataToUse = categoryData.length > 0 ? categoryData : (categories || []);
      
      if (dataToUse.length > 0) {
        // Check if the category exists
        const categoryExists = dataToUse.some(cat => cat.id === initialValues.categoryId);
        if (categoryExists) {
          setValue('categoryId', initialValues.categoryId);
          setInitialValuesApplied(true);
          if (initialValues.subcategoryName) {
            // Use a small delay to ensure category is set first
            const timer = setTimeout(() => {
              setValue('subcategoryName', initialValues.subcategoryName!);
            }, 100);
            return () => clearTimeout(timer);
          }
        }
      }
    }
  }, [open, initialValues.categoryId, initialValues.subcategoryName, categoryData, categories, setValue, initialValuesApplied]);

  // Update selected category when category changes
  useEffect(() => {
    if (watchCategoryId && categoryData.length > 0) {
      const category = categoryData.find(cat => cat.id === watchCategoryId);
      setSelectedCategory(category || null);
      // Only clear subcategory if we're not setting an initial value
      if (!initialValues.subcategoryName || watchCategoryId !== initialValues.categoryId) {
        setValue('subcategoryName', '');
        setSelectedSubcategory(null);
      }
    }
  }, [watchCategoryId, categoryData, setValue, initialValues]);

  // Update selected subcategory
  useEffect(() => {
    if (selectedCategory && watchSubcategoryName) {
      const subcat = selectedCategory.subcategories.find(
        sub => sub.name === watchSubcategoryName
      );
      setSelectedSubcategory(subcat || null);
    }
  }, [selectedCategory, watchSubcategoryName]);

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const newCategory: Category = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
      subcategories: [],
    };

    setCategoryData([...categoryData, newCategory]);
    setValue('categoryId', newCategory.id);
    setNewCategoryName('');
    setNewCategoryDialog(false);
    toast.success('Category added successfully');
  };

  const handleAddNewSubcategory = () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }
    if (!newSubcategoryName.trim()) {
      toast.error('Please enter a subcategory name');
      return;
    }

    const newSubcategory: Subcategory = {
      name: newSubcategoryName,
      projects: [],
    };

    const updatedCategories = categoryData.map(cat => {
      if (cat.id === selectedCategory.id) {
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSubcategory],
        };
      }
      return cat;
    });

    setCategoryData(updatedCategories);
    setValue('subcategoryName', newSubcategoryName);
    setNewSubcategoryName('');
    setNewSubcategoryDialog(false);
    toast.success('Subcategory added successfully');
  };


  // Helper function to convert string to kebab-case
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Helper function to parse funding value
  const parseFunding = (value?: string): number | string | null => {
    if (!value || !value.trim()) return null;
    // Try to extract number from strings like "$10M", "$1.5B", etc.
    const numberMatch = value.match(/[\d.]+/);
    if (numberMatch) {
      const num = parseFloat(numberMatch[0]);
      if (value.toUpperCase().includes('B')) return num * 1000000000;
      if (value.toUpperCase().includes('M')) return num * 1000000;
      if (value.toUpperCase().includes('K')) return num * 1000;
      return num;
    }
    // If it's a funding round like "Series A", return as string
    return value;
  };

  // Helper function to parse founded year
  const parseFounded = (value?: string): number | null => {
    if (!value || !value.trim()) return null;
    const year = parseInt(value, 10);
    return isNaN(year) ? null : year;
  };

  const onSubmit = (data: ProjectFormData) => {
    // Generate project ID from name
    const projectId = slugify(data.name);

    // Build project JSON
    const projectJson = {
      id: projectId,
      name: data.name,
      description: data.description || '',
      founded: parseFounded(data.founded),
      funding: parseFunding(data.raised),
      links: {
        ...(data.website && { homepage: data.website }),
        ...(data.logo && { logo: data.logo }),
        ...(data.twitter && { twitter: data.twitter }),
        ...(data.github && { github: data.github }),
      },
    };

    // Build map JSON snippet
    const selectedCategoryObj = categoryData.find(cat => cat.id === data.categoryId);
    const sectorName = selectedCategoryObj?.name || data.categoryId;
    const typeName = data.subcategoryName;
    const typeId = slugify(typeName);

    // Build GitHub issue URL
    const title = encodeURIComponent(`Add Project: ${data.name}`);
    const labels = encodeURIComponent('project:add');
    
    const body = encodeURIComponent(
      `Please paste or review the complete project JSON below. The \`id\` must be kebab-case and match the filename in \`public/data/projects/\`.

\`\`\`json
${JSON.stringify(projectJson, null, 2)}
\`\`\`

Step 2: Please add this project to the appropriate sector and type map. Find the map file \`public/data/maps/${slugify(sectorName)}.json\` and add \`"${projectId}"\` to the \`projects\` array of the type with \`id: "${typeId}"\` (name: "${typeName}").

Example - add \`"${projectId}"\` to the projects array:

\`\`\`json
{
  "sector": "${sectorName}",
  "types": [
    {
      "id": "${typeId}",
      "name": "${typeName}",
      "projects": [
        "${projectId}",
        "existing-project-1",
        "existing-project-2"
      ]
    }
  ]
}
\`\`\`
`
    );

    const githubUrl = `https://github.com/chainbase-labs/buildermaps.io/issues/new?title=${title}&labels=${labels}&body=${body}`;

    // Open GitHub issue in new tab
    window.open(githubUrl, '_blank');

    toast.success('Opening GitHub issue...', {
      duration: 3000,
    });
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="submit-project-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        zIndex: 1300,
      }}
      disablePortal={false}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography id="submit-project-modal-title" variant="h6" component="h2">
            Submit Project
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content - Scrollable */}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
            p: 0
          }}
        >
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading categories...</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
              <Typography color="error.dark">
                Failed to load categories. Please try again later.
              </Typography>
            </Box>
          )}

          {categories && (
            <div>
              <CardHeader className='pb-6'>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Please fill in all required fields. Your submission will be reviewed before being added to the map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Logo URL Section */}
                  <div className="space-y-2">
                    <Label htmlFor="logo">Project Logo URL</Label>
                    <Input
                      {...register('logo')}
                      placeholder="https://example.com/logo.png"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Enter the URL of your logo image</p>
                    {logoPreview && (
                      <div className="mt-3 p-4 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-20 max-w-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        {...register('name', { required: 'Project name is required' })}
                        placeholder="e.g., Circle"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        {...register('location', { required: 'Location is required' })}
                        placeholder="e.g., United States"
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && (
                        <p className="text-xs text-red-600">{errors.location.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Describe your project in a few sentences..."
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year</Label>
                      <Input
                        {...register('founded')}
                        placeholder="e.g., 2020"
                        type="text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="raised">Funding Raised</Label>
                      <Input
                        {...register('raised')}
                        placeholder="e.g., $10M"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <h3 className="text-sm text-gray-900">Categories *</h3>
                    
                    {/* Primary Category */}
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Primary Category *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={watch('categoryId') || ''}
                          onValueChange={(value) => setValue('categoryId', value)}
                          disabled={lockCategory}
                        >
                          <SelectTrigger 
                            className={errors.categoryId ? 'border-red-500' : ''}
                            disabled={lockCategory}
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {categoryData.length > 0 ? (
                              categoryData.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Loading categories...
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="newCategory">Category Name</Label>
                                <Input
                                  id="newCategory"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  placeholder="e.g., DeFi"
                                />
                              </div>
                              <Button onClick={handleAddNewCategory} className="w-full">
                                <Check className="h-4 w-4 mr-2" />
                                Add Category
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <input
                        type="hidden"
                        {...register('categoryId', { required: 'Primary category is required' })}
                      />
                      {errors.categoryId && (
                        <p className="text-xs text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>

                    {/* Secondary Category */}
                    {selectedCategory && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategoryName">Secondary Category *</Label>
                        <div className="flex gap-2">
                          <Select
                            value={watch('subcategoryName') || ''}
                            onValueChange={(value) => setValue('subcategoryName', value)}
                          >
                            <SelectTrigger className={errors.subcategoryName ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                              {selectedCategory.subcategories.map((subcat) => (
                                <SelectItem key={subcat.name} value={subcat.name}>
                                  {subcat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={newSubcategoryDialog} onOpenChange={setNewSubcategoryDialog}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Subcategory</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="newSubcategory">Subcategory Name</Label>
                                  <Input
                                    id="newSubcategory"
                                    value={newSubcategoryName}
                                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                                    placeholder="e.g., Lending"
                                  />
                                </div>
                                <Button onClick={handleAddNewSubcategory} className="w-full">
                                  <Check className="h-4 w-4 mr-2" />
                                  Add Subcategory
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <input
                          type="hidden"
                          {...register('subcategoryName', { required: 'Secondary category is required' })}
                        />
                        {errors.subcategoryName && (
                          <p className="text-xs text-red-600">{errors.subcategoryName.message}</p>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Links */}
                  <div className="space-y-4">
                    <h3 className="text-sm text-gray-900">Links</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Input
                          {...register('website')}
                          placeholder="https://example.com"
                          type="url"
                          className="pl-8"
                        />
                        <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">X (Twitter)</Label>
                      <div className="relative">
                        <Input
                          {...register('twitter')}
                          placeholder="https://x.com/username"
                          type="url"
                          className="pl-8"
                        />
                        <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <div className="relative">
                        <Input
                          {...register('github')}
                          placeholder="https://github.com/username"
                          type="url"
                          className="pl-8"
                        />
                        <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      Submit Project
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
