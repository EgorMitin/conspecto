import { AIProvider } from '../types';

const providerRegistry: Record<string, AIProvider> = {};

// Register a provider instance
export function registerProvider(name: string, provider: AIProvider) {
  providerRegistry[name] = provider;
}

// Get a provider by name
export function getProvider(name: string): AIProvider | undefined {
  return providerRegistry[name];
}

// Get all registered providers
export function getAllProviders(): Record<string, AIProvider> {
  return providerRegistry;
}
