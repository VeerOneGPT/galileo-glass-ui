/**
 * Glass Component Exports
 * 
 * These components are now consolidated with their main implementations.
 * This file re-exports the Glass variants from their respective folders
 * to maintain backward compatibility.
 */

// Re-export Glass components from their primary locations
export { GlassCard } from '../Card';
export { GlassButton } from '../Button';
export { GlassTypography } from '../Typography';
export { GlassBox } from '../Box';
export { GlassContainer } from '../Container';
export { GlassPaper } from '../Paper';
export { GlassTooltip } from '../Tooltip';

// Additional specialized glass components
export { GlassAutocomplete } from '../Autocomplete';
export { GlassDatePicker, GlassLocalizationProvider } from '../DatePicker';
export { GlassTagInput } from '../TagInput';
export { GlassCheckbox } from '../Checkbox';
export { GlassRadio } from '../Radio';
export { GlassSwitch } from '../Switch';
export { GlassSelect } from '../Select';
export { GlassSlider } from '../Slider';
export { GlassAlert } from '../Alert';
export { GlassProgress } from '../Progress';
export { GlassDialog } from '../Dialog';
export { GlassSnackbar } from '../Snackbar';
export { GlassModal } from '../Modal';
export { GlassLoader } from '../Loader';
export { GlassSkeleton } from '../Skeleton';
export { GlassTabs, GlassTab } from '../Tabs';
export { GlassPagination } from '../Pagination';
export { GlassMenu } from '../Menu';
export { GlassMenuItem } from '../MenuItem';
export { GlassChip } from '../Chip';
export { GlassAvatar } from '../Avatar';
export { GlassBadge } from '../Badge';
export { GlassList, GlassListItem } from '../List';
export { GlassTable } from '../Table';
export { GlassRating } from '../Rating';
export { GlassDrawer } from '../Drawer';
export { GlassFab } from '../Fab';

// Re-export Glass effects from theme provider for convenience
export {
  useGlassEffects,
  GlassSurfacePropTypes,
} from '../../theme/ThemeProvider';