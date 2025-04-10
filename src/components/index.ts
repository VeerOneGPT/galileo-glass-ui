/**
 * Galileo Glass UI - Components
 *
 * Core UI components with Glass styling.
 */

// Accessibility components
export * from './AccessibilityProvider';
export * from './AccessibilitySettings';

// Basic components
export { Button, GlassButton, MagneticButton } from './Button';
export { Card, Card as GlassCard } from './Card';
export { TextField, GlassTextField } from './TextField';
export { Typography, GlassTypography } from './Typography';
export { Box, GlassBox } from './Box';
export { Container, GlassContainer } from './Container';
export { Paper, GlassPaper } from './Paper';
export { Grid } from './Grid';
export { Stack } from './Stack';
export { Divider } from './Divider';
export { Link } from './Link';

// Form components
export { Autocomplete, GlassAutocomplete } from './Autocomplete';
export { 
  DatePicker, 
  GlassDatePicker, 
  GlassLocalizationProvider,
  createDateFnsAdapter 
} from './DatePicker';
export { TagInput, GlassTagInput } from './TagInput';
export {
  FormGroup,
  GlassFormGroup,
  FormControl,
  GlassFormControl,
  FormLabel,
  GlassFormLabel,
  FormHelperText,
  GlassFormHelperText,
} from './Form';
export { Checkbox, GlassCheckbox } from './Checkbox';
export { Radio, GlassRadio } from './Radio';
export { Switch, GlassSwitch } from './Switch';
export { Select, GlassSelect } from './Select';
export { Slider, GlassSlider } from './Slider';

// Feedback components
export { Alert, GlassAlert } from './Alert';
export { Progress, GlassProgress } from './Progress';
export { Dialog, GlassDialog } from './Dialog';
export { Snackbar, GlassSnackbar } from './Snackbar';
export { Modal, GlassModal } from './Modal';
export { Loader, GlassLoader } from './Loader';
export { Skeleton, GlassSkeleton } from './Skeleton';

// Navigation components
export { Tabs, TabPanel, GlassTabs } from './Tabs';
export { GlassTabBar } from './GlassTabBar';
export { GlassTabBar as TabBar } from './GlassTabBar';
export { Pagination, GlassPagination } from './Pagination';
export { Menu, GlassMenu } from './Menu';
export { MenuItem, GlassMenuItem } from './MenuItem';
export {
  BottomNavigation,
  BottomNavigationAction,
  GlassBottomNavigation,
} from './BottomNavigation';
export { Breadcrumbs, GlassBreadcrumbs } from './Breadcrumbs';
export { Toolbar, GlassToolbar } from './Toolbar';
export {
  Accordion,
  GlassAccordion,
  AccordionSummary,
  GlassAccordionSummary,
  AccordionDetails,
  GlassAccordionDetails,
} from './Accordion';
export { TreeView, GlassTreeView, TreeItem, GlassTreeItem } from './TreeView';

// Data display components
export { Chip, GlassChip } from './Chip';
export { Avatar, GlassAvatar } from './Avatar';
export { Badge, GlassBadge } from './Badge';
export { List, ListItem, GlassList, GlassListItem } from './List';
export { Table, GlassTable, TableHead, TableBody, TableRow, TableCell } from './Table';
export {
  ImageList,
  GlassImageList,
  ImageListItem,
  GlassImageListItem,
  ImageListItemBar,
  GlassImageListItemBar,
} from './ImageList';
export { Rating, GlassRating } from './Rating';

// Utility components
export { Tooltip, GlassTooltip } from './Tooltip';
export { Drawer, GlassDrawer } from './Drawer';
export { Fab, GlassFab } from './Fab';
export { Backdrop } from './Backdrop';
export { Icon } from './Icon';
export { SpeedDial, GlassSpeedDial, SpeedDialAction, SpeedDialIcon } from './SpeedDial';
export {
  ToggleButton,
  GlassToggleButton,
  ToggleButtonGroup,
  GlassToggleButtonGroup,
} from './ToggleButton';

// Cookie Consent Components
export {
  CookieConsent,
  GlassCookieConsent,
  GlobalCookieConsent,
  GlassGlobalCookieConsent,
  CompactCookieNotice,
  GlassCompactCookieNotice,
} from './CookieConsent';

// Navigation Components
export {
  GlassNavigation,
  ResponsiveNavigation,
  PageTransition,
  ZSpaceAppLayout,
} from './Navigation';

// Theme Components
export {
  GlassThemeSwitcher,
  GlassThemeDemo,
  ThemedGlassComponents,
  useThemedGlass,
} from './ThemeComponents';

// Performance Components
export { PerformanceMonitor, OptimizedGlassContainer } from './Performance';

// Advanced Components
export { DynamicAtmosphere } from './DynamicAtmosphere';
export { ContextAwareGlass } from './ContextAwareGlass';
export {
  KpiCard,
  PerformanceMetricCard,
  GlassPerformanceMetricCard,
  InteractiveKpiCard,
  GlassInteractiveKpiCard,
} from './KpiCard';
export {
  DimensionalGlass,
  HeatGlass,
  FrostedGlass,
  PageGlassContainer,
  WidgetGlass,
} from './surfaces';
export { VisualFeedback, RippleButton, FocusIndicator, StateIndicator } from './VisualFeedback';

// Background Components
export { AtmosphericBackground, ParticleBackground } from './backgrounds';

// Data visualization components
export * from './ImageViewer';

// Form components with physics
export * from './MultiSelect';
export * from './DateRangePicker';

// Layout components with physics
export * from './Masonry';
export * from './Timeline';
export * from './GlassStepper';

// Glass Presets
export {
  CleanGlassContainer,
  FrostedGlassContainer,
  TexturedGlassContainer,
  SubtleGlassContainer,
  StandardGlassContainer,
  ImmersiveGlassContainer,
  DashboardGlassContainer,
  FormGlassContainer,
  ModalGlassContainer,
} from './GlassPresets';

// Local version
export const componentsVersion = '1.0.0';

// New glass components
export * from './GlassCardLink/GlassCardLink';
export { default as ChartWrapper } from './Chart/ChartWrapper';

// Export Carousel components
export { 
  GlassCarousel,
  CarouselNavigation,
  CarouselIndicators,
  CarouselSlideItem,
  PlayPauseControl,
  useCarousel
} from './Carousel';

// Export Focus Ring component (Task 8 Fix)
export { GlassFocusRing } from './GlassFocusRing';

// Import and export specific components from DataChart
import { GlassDataChart } from './DataChart/GlassDataChart';
import { ModularGlassDataChart } from './DataChart/ModularGlassDataChart';
import { 
  formatValue,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatWithUnits,
  formatDate as formatChartDate  
} from './DataChart/GlassDataChartUtils';

export { 
  GlassDataChart,
  ModularGlassDataChart,
  formatValue,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatWithUnits,
  formatChartDate
};

// Export DataChart as an alias of GlassDataChart
export { GlassDataChart as DataChart };
