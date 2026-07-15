"use client"; // Indica que este componente utiliza hooks de estado y corre en el cliente

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Los subcomponentes de Tabs deben renderizarse dentro de <Tabs>');
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    children: ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, children, className = "" }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`flex flex-col w-full ${className}`}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

// ----------------------------------------------------------------------

interface TabsListProps {
    children: ReactNode;
    className?: string;
}
export function TabsList({ children, className = "" }: TabsListProps) {
    return (
        <div className={`flex gap-2 p-1 bg-brand-surface border border-gray-700/50 rounded-lg w-fit ${className}`}>
            {children}
        </div>
    );
}

// ----------------------------------------------------------------------

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}
export function TabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer focus:outline-none ${isActive
                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${className}`}
        >
            {children}
        </button>
    );
}

// ----------------------------------------------------------------------

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}
export function TabsContent({ value, children, className = "" }: TabsContentProps) {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) return null;

    return (
        <div className={`mt-4 w-full animate-fade-in ${className}`}>
            {children}
        </div>
    );
}

// Mapeo de subcomponentes para sintaxis de punto limpia
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;