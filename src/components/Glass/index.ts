/**
 * Glass Component Exports
 *
 * This file primarily serves for backward compatibility or specific organization.
 * Many 'Glass' variants are directly exported alongside their base components
 * from their respective module index files (e.g., export { Button, GlassButton } from './Button').
 * This file re-exports some of them for convenience or historical reasons.
 */

// Re-export common Glass components from their primary locations
export { GlassButton } from '../Button';
export { GlassTypography } from '../Typography';
export { GlassBox } from '../Box';
export { GlassContainer } from '../Container';
export { GlassPaper } from '../Paper';
export { GlassTooltip } from '../Tooltip';
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
export { GlassPagination } from '../Pagination';
export { GlassMenuItem } from '../MenuItem';
export { GlassChip } from '../Chip';
export { GlassAvatar } from '../Avatar';
export { GlassBadge } from '../Badge';
export { GlassTable } from '../Table';
export { GlassRating } from '../Rating';
export { GlassDrawer } from '../Drawer';
export { GlassFab } from '../Fab';
export { GlassToggleButton } from '../ToggleButton';
export { GlassImageViewer } from '../ImageViewer';
export { GlassList, GlassListItem } from '../List';
export { GlassMasonry } from '../Masonry';
export { GlassNavigation } from '../Navigation';
export { GlassTextField } from '../TextField';
export { GlassTimeline } from '../Timeline';
export { GlassMultiSelect } from '../MultiSelect';
export { GlassDateRangePicker } from '../DateRangePicker';

// Re-export Glass effects from theme provider
export {
  useGlassEffects,
} from '../../theme/ThemeProvider';

// NOTE: Removed duplicate exports and exports pointing to non-existent
// modules/members based on tsc --noEmit output.
// Surface components (DimensionalGlass, HeatGlass, etc.) should be exported
// from src/components/surfaces/index.ts.

// The following block (lines 61-74 in the previous state) was incorrectly added and is now removed.
// export { default as GlassButton, GlassButtonProps } from './GlassButton';
// export { default as GlassCard } from './GlassCard';
// export { default as GlassDialog } from './GlassDialog';
// export { default as GlassInput } from './GlassInput';
// export { default as GlassMenu } from './GlassMenu';
// export { default as GlassModal } from './GlassModal';
// export { default as GlassNavigation } from './GlassNavigation';
// export { default as GlassPaper } from './GlassPaper';
// export { default as GlassPopover } from './GlassPopover';
// export { default as GlassSheet } from './GlassSheet';
// export { default as GlassSurface, GlassSurfaceProps } from './GlassSurface';
// export { default as GlassSwitch } from './GlassSwitch';
// export { default as GlassTabs } from './GlassTabs';
// export { default as GlassTooltip } from './GlassTooltip';
// 
// // Utility components
// export { default as InteractiveGlass } from './utils/InteractiveGlass';
// export { default as HeatGlass } from './utils/HeatGlass';
// 
// // Core mixins (if needed to be exported from here)
// // export { glassSurface } from '../../core/mixins/glassSurface';
// // export { glassGlow } from '../../core/mixins/glowEffects';