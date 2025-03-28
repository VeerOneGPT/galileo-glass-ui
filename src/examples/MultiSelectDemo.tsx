/**
 * GlassMultiSelect Demo Component
 *
 * Demonstrates the physics-based GlassMultiSelect component with various configurations
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { GlassMultiSelect, MultiSelectOption } from '../components/MultiSelect';

// Sample data
const programmingLanguages: MultiSelectOption[] = [
  { id: 'js', label: 'JavaScript', value: 'javascript', description: 'Web language of choice' },
  { id: 'ts', label: 'TypeScript', value: 'typescript', description: 'JavaScript with types' },
  { id: 'py', label: 'Python', value: 'python', description: 'Popular for ML and data science' },
  { id: 'java', label: 'Java', value: 'java', description: 'Enterprise-grade JVM language' },
  { id: 'go', label: 'Go', value: 'golang', description: 'Fast and simple compiled language' },
  { id: 'rust', label: 'Rust', value: 'rust', description: 'Memory safe systems programming' },
  { id: 'rb', label: 'Ruby', value: 'ruby', description: 'Developer happiness focused' },
  { id: 'php', label: 'PHP', value: 'php', description: 'Server-side web language' },
  { id: 'swift', label: 'Swift', value: 'swift', description: 'Modern Apple ecosystem language' },
  { id: 'kotlin', label: 'Kotlin', value: 'kotlin', description: 'Modern JVM language' },
  { id: 'scala', label: 'Scala', value: 'scala', description: 'Functional JVM language' },
  { id: 'csharp', label: 'C#', value: 'csharp', description: '.NET ecosystem language' },
];

// Sample grouped data
const frameworks: MultiSelectOption[] = [
  { id: 'react', label: 'React', value: 'react', group: 'js', description: 'UI library by Facebook' },
  { id: 'vue', label: 'Vue', value: 'vue', group: 'js', description: 'Progressive JavaScript framework' },
  { id: 'angular', label: 'Angular', value: 'angular', group: 'js', description: 'Full-featured framework by Google' },
  { id: 'svelte', label: 'Svelte', value: 'svelte', group: 'js', description: 'Compile-time framework' },
  { id: 'django', label: 'Django', value: 'django', group: 'python', description: 'Full-stack web framework' },
  { id: 'flask', label: 'Flask', value: 'flask', group: 'python', description: 'Lightweight web framework' },
  { id: 'spring', label: 'Spring', value: 'spring', group: 'java', description: 'Enterprise Java framework' },
  { id: 'rails', label: 'Ruby on Rails', value: 'rails', group: 'ruby', description: 'Ruby web framework' },
  { id: 'laravel', label: 'Laravel', value: 'laravel', group: 'php', description: 'PHP web framework' },
  { id: 'dotnet', label: '.NET', value: 'dotnet', group: 'csharp', description: 'Microsoft\'s development platform' },
];

const frameworkGroups = [
  { id: 'js', label: 'JavaScript Frameworks' },
  { id: 'python', label: 'Python Frameworks' },
  { id: 'java', label: 'Java Frameworks' },
  { id: 'ruby', label: 'Ruby Frameworks' },
  { id: 'php', label: 'PHP Frameworks' },
  { id: 'csharp', label: 'C# Frameworks' },
];

// Demo container
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
`;

const DemoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DemoTitle = styled.h3`
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
`;

/**
 * GlassMultiSelect Demo Component
 */
export const MultiSelectDemo: React.FC = () => {
  const [basicSelected, setBasicSelected] = useState<MultiSelectOption[]>([]);
  const [physicsSelected, setPhysicsSelected] = useState<MultiSelectOption[]>([]);
  const [snappySelected, setSnappySelected] = useState<MultiSelectOption[]>([]);
  const [bouncySelected, setBouncySelected] = useState<MultiSelectOption[]>([]);
  const [groupedSelected, setGroupedSelected] = useState<MultiSelectOption[]>([]);
  
  return (
    <DemoContainer>
      <SectionTitle>GlassMultiSelect Component</SectionTitle>
      
      <DemoSection>
        <DemoTitle>Basic Multi-Select</DemoTitle>
        <GlassMultiSelect
          options={programmingLanguages}
          value={basicSelected}
          onChange={setBasicSelected}
          placeholder="Select programming languages..."
          label="Programming Languages"
          helperText="Select your favorite programming languages"
        />
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Physics Animations - Default</DemoTitle>
        <GlassMultiSelect
          options={programmingLanguages}
          value={physicsSelected}
          onChange={setPhysicsSelected}
          placeholder="Select with default physics..."
          label="Default Physics Animation"
          physics={{
            animationPreset: 'default',
            dragToReorder: true,
            hoverEffects: true
          }}
        />
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Physics Animations - Snappy</DemoTitle>
        <GlassMultiSelect
          options={programmingLanguages}
          value={snappySelected}
          onChange={setSnappySelected}
          placeholder="Select with snappy physics..."
          label="Snappy Physics Animation"
          physics={{
            animationPreset: 'snappy',
            dragToReorder: true,
            hoverEffects: true
          }}
        />
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Physics Animations - Bouncy</DemoTitle>
        <GlassMultiSelect
          options={programmingLanguages}
          value={bouncySelected}
          onChange={setBouncySelected}
          placeholder="Select with bouncy physics..."
          label="Bouncy Physics Animation"
          physics={{
            animationPreset: 'bouncy',
            dragToReorder: true,
            hoverEffects: true
          }}
        />
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Grouped Options</DemoTitle>
        <GlassMultiSelect
          options={frameworks}
          value={groupedSelected}
          onChange={setGroupedSelected}
          placeholder="Select frameworks..."
          label="Framework Selection"
          withGroups
          groups={frameworkGroups}
          physics={{
            animationPreset: 'default',
            dragToReorder: true,
            hoverEffects: true
          }}
        />
      </DemoSection>
      
      <DemoSection>
        <DemoTitle>Advanced Features</DemoTitle>
        <GlassMultiSelect
          options={programmingLanguages}
          placeholder="Advanced features demo..."
          label="Advanced Multi-Select"
          maxSelections={3}
          creatable
          onCreateOption={(inputValue) => ({
            id: `custom-${inputValue}`,
            label: inputValue,
            value: inputValue.toLowerCase(),
            description: 'Custom created option'
          })}
          physics={{
            tension: 200,
            friction: 10,
            dragToReorder: true,
            hoverEffects: true
          }}
          virtualization={{
            enabled: true,
            itemHeight: 40
          }}
          error={false}
          errorMessage="You can select a maximum of 3 options"
          helperText="Try creating a custom option by typing and pressing Enter"
        />
      </DemoSection>
    </DemoContainer>
  );
};

export default MultiSelectDemo;