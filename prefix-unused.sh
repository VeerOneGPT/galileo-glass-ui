#!/bin/bash

# Fix unused variables by adding underscore prefix

# ThemeProvider.tsx
echo "Fixing ThemeProvider.tsx..."
sed -i '' 's/import { createThemeContext } /import { createThemeContext as _createThemeContext } /g' src/theme/ThemeProvider.tsx
sed -i '' 's/, ThemeContextType/, ThemeContextType as _ThemeContextType/g' src/theme/ThemeProvider.tsx
sed -i '' 's/ThemeVariant, Theme/ThemeVariant as _ThemeVariant, Theme as _Theme/g' src/theme/ThemeProvider.tsx
sed -i '' 's/THEME_NAMES,/THEME_NAMES as _THEME_NAMES,/g' src/theme/ThemeProvider.tsx
sed -i '' 's/GLASS_QUALITY_TIERS,/GLASS_QUALITY_TIERS as _GLASS_QUALITY_TIERS,/g' src/theme/ThemeProvider.tsx
sed -i '' 's/const isolateTheme/const _isolateTheme/g' src/theme/ThemeProvider.tsx
sed -i '' 's/const enableOptimizations/const _enableOptimizations/g' src/theme/ThemeProvider.tsx
sed -i '' 's/const updateOnlyOnCommit/const _updateOnlyOnCommit/g' src/theme/ThemeProvider.tsx

# animation test files
echo "Fixing animation test files..."
sed -i '' 's/FlattenSimpleInterpolation/FlattenSimpleInterpolation as _FlattenSimpleInterpolation/g' src/types/testing.d.ts

# optimization files
echo "Fixing optimization files..."
sed -i '' 's/OptimizedStyleSheetConfig,/OptimizedStyleSheetConfig as _OptimizedStyleSheetConfig,/g' src/utils/optimization/globalOptimizers.ts
sed -i '' 's/PaintOptimizationConfig,/PaintOptimizationConfig as _PaintOptimizationConfig,/g' src/utils/optimization/globalOptimizers.ts
sed -i '' 's/const optimizedCss/const _optimizedCss/g' src/utils/optimization/optimizedStyleSheet.ts
sed -i '' 's/const currentOptimization/const _currentOptimization/g' src/utils/optimization/paintOptimizer.ts

# performance monitor test
echo "Fixing performance monitor test..."
sed -i '' 's/MetricSeverity:/MetricSeverity as _MetricSeverity:/g' src/utils/performance/__tests__/performanceMonitor.test.ts

echo "Done!"