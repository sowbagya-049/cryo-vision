import { ProductType } from '../types';

export interface ProductProfile {
    name: string;
    baseShelfLifeDays: number; // Shelf life at optimal temperature
    optimalTempMin: number;
    optimalTempMax: number;
    sensitivityFactor: number; // Multiplier for decay rate per degree of excess heat
    description: string;
}

export const PRODUCT_DATABASE: Record<ProductType, ProductProfile> = {
    'Vaccine': {
        name: 'COVID-19 Vaccine',
        baseShelfLifeDays: 30,
        optimalTempMin: 2,
        optimalTempMax: 8,
        sensitivityFactor: 2.0, // Very sensitive
        description: 'Critical medical supply. Extremely sensitive to heat.'
    },
    'Dairy': {
        name: 'Fresh Milk',
        baseShelfLifeDays: 10,
        optimalTempMin: 1,
        optimalTempMax: 4,
        sensitivityFactor: 1.5,
        description: 'Perishable dairy product. Spoils quickly in warmth.'
    },
    'Frozen Food': {
        name: 'Premium Ice Cream',
        baseShelfLifeDays: 180,
        optimalTempMin: -25,
        optimalTempMax: -15,
        sensitivityFactor: 1.2,
        description: 'Frozen goods. Texture ruined by thawing.'
    },
    'Tomato': {
        name: 'Organic Tomatoes',
        baseShelfLifeDays: 20,
        optimalTempMin: 12,
        optimalTempMax: 15,
        sensitivityFactor: 1.8, // Ripens very fast in heat
        description: 'Fresh produce. Heat accelerates ripening and rotting.'
    },
    'Banana': {
        name: 'Cavendish Bananas',
        baseShelfLifeDays: 14,
        optimalTempMin: 13,
        optimalTempMax: 15,
        sensitivityFactor: 2.5, // Extremely sensitive to both cold (chilling injury) and heat
        description: 'Tropical fruit. Sensitive to both cold and heat.'
    }
};
