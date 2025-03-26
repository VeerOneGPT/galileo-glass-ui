/**
 * Glass TagInput Component
 *
 * A comprehensive tag input component with glass morphism styling.
 */
import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ClearIcon from '../icons/ClearIcon';

import { Tag, TagInputProps } from './types';

// Utility function to generate unique ID
const generateId = () => {
  return `tag-${Math.random().toString(36).substring(2, 9)}`;
};

// Styled components
const TagInputRoot = styled.div<{
  $fullWidth: boolean;
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${props => (props.$fullWidth ? '100%' : '300px')};
  position: relative;

  /* Animation on mount */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    `
    animation: fadeIn 0.4s ease-out;
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}
`;

const InputContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $focused: boolean;
  $disabled: boolean;
  $hasError: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  min-height: ${props =>
    props.$size === 'small' ? '36px' : props.$size === 'large' ? '48px' : '40px'};
  gap: 6px;
  padding: ${props =>
    props.$size === 'small' ? '4px 8px' : props.$size === 'large' ? '8px 16px' : '6px 12px'};

  /* Enhanced glass styling */
  ${props =>
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}

  border-radius: 8px;
  border: 1px solid
    ${props =>
      props.$hasError
        ? 'rgba(240, 82, 82, 0.8)'
        : props.$focused
        ? 'rgba(99, 102, 241, 0.8)'
        : 'rgba(255, 255, 255, 0.12)'};
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  /* Focused state */
  ${props =>
    props.$focused &&
    `
    border-color: rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}

  /* Error state */
  ${props =>
    props.$hasError &&
    `
    border-color: rgba(240, 82, 82, 0.8);
    box-shadow: 0 0 0 1px rgba(240, 82, 82, 0.3);
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.6;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.01);
  `}
  
  /* Focus outline */
  &:focus-within {
    outline: none;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
`;

const TagItem = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color?: string;
  $disabled?: boolean;
  $clickable?: boolean;
}>`
  display: flex;
  align-items: center;
  background-color: ${props =>
    props.$color ? `rgba(${props.$color}, 0.15)` : 'rgba(99, 102, 241, 0.15)'};
  border-radius: 4px;
  padding: ${props => (props.$size === 'small' ? '2px 6px' : '4px 8px')};
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.75rem'};
  gap: 6px;
  max-width: 200px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;

  ${props =>
    props.$disabled &&
    `
    opacity: 0.5;
    background-color: rgba(255, 255, 255, 0.1);
  `}

  ${props =>
    props.$clickable &&
    !props.$disabled &&
    `
    cursor: pointer;
    
    &:hover {
      background-color: ${
        props.$color ? `rgba(${props.$color}, 0.25)` : 'rgba(99, 102, 241, 0.25)'
      };
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const TagLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TagDeleteButton = styled.button<{
  $disabled?: boolean;
}>`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  padding: 0;
  height: 16px;
  width: 16px;
  opacity: 0.7;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    opacity: ${props => (props.$disabled ? '0.7' : '1')};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Input = styled.input<{
  $size: 'small' | 'medium' | 'large';
  $disabled: boolean;
}>`
  background: transparent;
  border: none;
  outline: none;
  width: auto;
  flex: 1;
  min-width: 60px;
  color: inherit;
  font-size: ${props =>
    props.$size === 'small' ? '0.875rem' : props.$size === 'large' ? '1rem' : '0.875rem'};

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const HelperText = styled.div<{
  $hasError: boolean;
}>`
  margin-top: 4px;
  font-size: 0.75rem;
  min-height: 18px;
  color: ${props => (props.$hasError ? 'rgba(240, 82, 82, 0.9)' : 'rgba(255, 255, 255, 0.6)')};
`;

const SuggestionsContainer = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
  display: ${props => (props.$open ? 'block' : 'none')};
  ${props =>
    glassSurface({
      elevation: 3,
      blurStrength: 'standard',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}
  border-radius: 8px;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);

  /* Enhanced dropdown animation */
  ${props =>
    !props.$reducedMotion &&
    `
    animation: reveal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: top center;
    
    @keyframes reveal {
      from { opacity: 0; transform: scaleY(0.9) translateY(-8px); }
      to { opacity: 1; transform: scaleY(1) translateY(0); }
    }
  `}

  /* Subtle scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.4);
    }
  }
`;

const SuggestionItem = styled.div<{
  $highlighted: boolean;
}>`
  padding: 8px 12px;
  cursor: pointer;
  margin: 4px 8px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  background: ${props => (props.$highlighted ? 'rgba(99, 102, 241, 0.1)' : 'transparent')};
  transition: all 0.15s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
    transform: translateX(2px);
  }
`;

const NoSuggestions = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

/**
 * TagInput Component Implementation
 */
function TagInputComponent(props: TagInputProps, ref: React.ForwardedRef<HTMLInputElement>) {
  const {
    value,
    defaultValue,
    onChange,
    suggestions = [],
    allowAdd = true,
    allowDelete = true,
    disabled = false,
    readOnly = false,
    label,
    helperText,
    error = false,
    placeholder = 'Add tags...',
    maxTags,
    validateTag,
    createTag,
    filterSuggestions,
    showSuggestions = true,
    size = 'medium',
    fullWidth = false,
    animate = false,
    clickableTags = false,
    onTagClick,
    renderTag,
    style,
    className,
    autoFocus = false,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // State
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Initialize tags
  useEffect(() => {
    if (value !== undefined) {
      // Controlled component
      setTags(value);
    } else if (defaultValue !== undefined) {
      // Uncontrolled with defaultValue
      setTags(defaultValue);
    }
  }, []);

  // Update tags when value changes (controlled component)
  useEffect(() => {
    if (value !== undefined) {
      setTags(value);
    }
  }, [value]);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node) &&
        !(suggestionsRef.current && suggestionsRef.current.contains(event.target as Node))
      ) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Default tag creation function
  const defaultCreateTag = useCallback((inputValue: string): Tag => {
    return {
      id: generateId(),
      label: inputValue.trim(),
    };
  }, []);

  // Default validation function
  const defaultValidateTag = useCallback((inputValue: string): boolean => {
    return inputValue.trim().length > 0;
  }, []);

  // Default filter function
  const defaultFilterSuggestions = useCallback(
    (inputValue: string, suggestions: Tag[]): Tag[] => {
      const normalizedInput = inputValue.toLowerCase().trim();
      if (!normalizedInput) return [];

      return suggestions.filter(
        suggestion =>
          suggestion.label.toLowerCase().includes(normalizedInput) &&
          !tags.some(tag => tag.id === suggestion.id)
      );
    },
    [tags]
  );

  // Use custom or default functions
  const createTagFn = createTag || defaultCreateTag;
  const validateTagFn = validateTag || defaultValidateTag;
  const filterSuggestionsFn = filterSuggestions || defaultFilterSuggestions;

  // Filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || !inputValue.trim()) return [];
    return filterSuggestionsFn(inputValue, suggestions);
  }, [inputValue, suggestions, showSuggestions, filterSuggestionsFn]);

  // Check if max tags limit reached
  const maxTagsReached = useMemo(() => {
    return maxTags !== undefined && tags.length >= maxTags;
  }, [tags, maxTags]);

  // Add a new tag
  const addTag = useCallback(
    (tagToAdd: Tag | string) => {
      if (disabled || readOnly || maxTagsReached) return;

      let newTag: Tag;

      if (typeof tagToAdd === 'string') {
        // Create a tag from input
        const input = tagToAdd.trim();
        if (!validateTagFn(input)) return;
        newTag = createTagFn(input);
      } else {
        // Use tag object directly
        newTag = tagToAdd;
      }

      // Check if tag already exists
      const tagExists = tags.some(tag => tag.id === newTag.id);
      if (tagExists) return;

      const newTags = [...tags, newTag];

      setTags(newTags);
      setInputValue('');
      setShowSuggestionsDropdown(false);
      setHighlightedIndex(-1);

      if (onChange) {
        onChange(newTags);
      }
    },
    [disabled, readOnly, maxTagsReached, validateTagFn, createTagFn, tags, onChange]
  );

  // Remove a tag
  const removeTag = useCallback(
    (indexToRemove: number) => {
      if (disabled || readOnly || !allowDelete) return;

      const newTags = tags.filter((_, index) => index !== indexToRemove);

      setTags(newTags);

      if (onChange) {
        onChange(newTags);
      }

      // Focus the input after removing
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [disabled, readOnly, allowDelete, tags, onChange]
  );

  // Handle tag click
  const handleTagClick = useCallback(
    (tag: Tag, index: number) => {
      if (disabled || tag.disabled) return;

      if (clickableTags && onTagClick) {
        onTagClick(tag);
      }
    },
    [disabled, clickableTags, onTagClick]
  );

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (showSuggestions && newValue.trim()) {
        setShowSuggestionsDropdown(true);
        setHighlightedIndex(0);
      } else {
        setShowSuggestionsDropdown(false);
        setHighlightedIndex(-1);
      }
    },
    [showSuggestions]
  );

  const handleInputFocus = useCallback(() => {
    setFocused(true);
    if (showSuggestions && inputValue.trim()) {
      setShowSuggestionsDropdown(true);
    }
  }, [showSuggestions, inputValue]);

  const handleInputBlur = useCallback(() => {
    setFocused(false);

    // Add the current input as a tag if it has value
    if (allowAdd && inputValue.trim() && validateTagFn(inputValue)) {
      addTag(inputValue);
    }
  }, [allowAdd, inputValue, validateTagFn, addTag]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
            // Select the highlighted suggestion
            addTag(filteredSuggestions[highlightedIndex]);
          } else if (allowAdd && inputValue.trim() && validateTagFn(inputValue)) {
            // Add new tag from input
            addTag(inputValue);
          }
          break;

        case 'Backspace':
          if (inputValue === '' && tags.length > 0 && allowDelete) {
            // Remove the last tag
            removeTag(tags.length - 1);
          }
          break;

        case 'ArrowDown':
          if (showSuggestionsDropdown && filteredSuggestions.length > 0) {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
          }
          break;

        case 'ArrowUp':
          if (showSuggestionsDropdown && filteredSuggestions.length > 0) {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
          }
          break;

        case 'Escape':
          setShowSuggestionsDropdown(false);
          break;

        case ',':
        case ';':
        case ' ':
          // These characters can be used to separate tags
          if (allowAdd && inputValue.trim() && validateTagFn(inputValue)) {
            e.preventDefault();
            addTag(inputValue);
          }
          break;
      }
    },
    [
      highlightedIndex,
      filteredSuggestions,
      allowAdd,
      inputValue,
      validateTagFn,
      addTag,
      tags,
      allowDelete,
      removeTag,
      showSuggestionsDropdown,
    ]
  );

  // Handle forwarded ref
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Determine helper text content
  const helperTextContent =
    error === true ? helperText : typeof error === 'string' ? error : helperText;
  const hasError = Boolean(error);

  // Render a tag
  const renderTagItem = (tag: Tag, index: number) => {
    const handleDelete = () => removeTag(index);
    const handleClick = () => handleTagClick(tag, index);

    // Use custom renderer if provided
    if (renderTag) {
      return renderTag(tag, { onDelete: handleDelete, onClick: handleClick });
    }

    return (
      <TagItem
        key={tag.id}
        $size={size}
        $color={tag.color}
        $disabled={tag.disabled || disabled}
        $clickable={clickableTags && !!onTagClick}
        onClick={clickableTags && !!onTagClick ? handleClick : undefined}
      >
        <TagLabel>{tag.label}</TagLabel>
        {allowDelete && !tag.disabled && !disabled && !readOnly && (
          <TagDeleteButton
            onClick={e => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Remove"
            aria-label={`Remove ${tag.label}`}
            $disabled={tag.disabled}
          >
            <ClearIcon fontSize="small" />
          </TagDeleteButton>
        )}
      </TagItem>
    );
  };

  // Render suggestions
  const renderSuggestions = () => {
    if (!showSuggestionsDropdown || filteredSuggestions.length === 0) return null;

    return (
      <SuggestionsContainer
        ref={suggestionsRef}
        $open={showSuggestionsDropdown}
        $reducedMotion={prefersReducedMotion}
      >
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion.id}
              $highlighted={index === highlightedIndex}
              onClick={() => addTag(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion.label}
            </SuggestionItem>
          ))
        ) : (
          <NoSuggestions>No suggestions</NoSuggestions>
        )}
      </SuggestionsContainer>
    );
  };

  return (
    <TagInputRoot
      ref={rootRef}
      className={className}
      style={style}
      $fullWidth={fullWidth}
      $animate={animate}
      $reducedMotion={prefersReducedMotion}
    >
      {label && <Label>{label}</Label>}

      <InputContainer
        $size={size}
        $focused={focused}
        $disabled={disabled}
        $hasError={hasError}
        onClick={() => {
          if (!disabled && !readOnly && inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <TagsContainer>
          {tags.map((tag, index) => renderTagItem(tag, index))}

          {!maxTagsReached && !readOnly && (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : ''}
              disabled={disabled}
              readOnly={readOnly}
              $size={size}
              $disabled={disabled}
              autoFocus={autoFocus}
              {...rest}
            />
          )}
        </TagsContainer>
      </InputContainer>

      {renderSuggestions()}

      {helperTextContent && <HelperText $hasError={hasError}>{helperTextContent}</HelperText>}
    </TagInputRoot>
  );
}

/**
 * TagInput Component
 *
 * A comprehensive tag input component with glass morphism styling.
 */
const TagInput = forwardRef(TagInputComponent);

/**
 * GlassTagInput Component
 *
 * Glass variant of the TagInput component.
 */
const GlassTagInput = TagInput;

export default TagInput;
export { TagInput, GlassTagInput };
