import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
            cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
            refetchOnWindowFocus: false, // Don't refetch when window focused
            retry: 1, // Retry failed requests once
        },
        mutations: {
            retry: false, // Don't retry mutations
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
