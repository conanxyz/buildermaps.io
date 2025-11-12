import React from 'react'
import ReactDOMClient from 'react-dom/client'
import singleSpaReact from 'single-spa-react'
import Root from './root.component'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            networkMode: 'always',
        },
    },
})

const lifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    rootComponent: () => (
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>                
                  <Root />
                  <Toaster containerClassName="font-medium" />
                </QueryClientProvider>
            </BrowserRouter>
    ),
    errorBoundary(err, info, props) {
        // Customize the root error boundary for your microfrontend here.
        return null
    },
})

const { bootstrap, unmount } = lifecycles

const mount = (config) => {
    if (document.getElementById('home-placeholder')) {
        document.getElementById('home-placeholder').style.display = 'none'
        document.getElementById('home-placeholder').remove()
    }

    document.title = 'Trench | Chainbase.com'

    return lifecycles.mount(config)
}

window.onunhandledrejection = function (event) {
    console.error('[Global Promise Rejection]', event.reason)

    event.preventDefault()
}
export { bootstrap, mount, unmount }
