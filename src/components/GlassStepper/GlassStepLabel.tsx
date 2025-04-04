import React from 'react';
import styled from 'styled-components';
import { Box } from '../Box';
import { Typography } from '../Typography';

interface GlassStepLabelProps {
  label?: string;
  active: boolean;
  completed: boolean;
  orientation: 'horizontal' | 'vertical';
}

const StepLabelContainer = styled(Box)<{ $orientation: 'horizontal' | 'vertical' }>`
  margin-left: ${props => props.$orientation === 'horizontal' ? (props.theme.spacing?.md ?? 8)+'px' : '0'};
  margin-top: ${props => props.$orientation === 'vertical' ? (props.theme.spacing?.sm ?? 4)+'px' : '0'};
`;

export const GlassStepLabel: React.FC<GlassStepLabelProps> = ({ 
    label, 
    active, 
    completed, 
    orientation 
}) => {
    if (!label) {
        return null;
    }

    return (
        <StepLabelContainer $orientation={orientation}>
            <Typography 
                variant={orientation === 'vertical' ? 'caption' : 'body2'} 
                color={active ? 'primary' : completed ? 'textPrimary' : 'textSecondary'}
                style={{ 
                    fontWeight: active ? 'bold' : 'normal',
                    transition: 'color 0.3s ease, font-weight 0.3s ease', // Add transition
                }}
            >
                {label}
            </Typography>
        </StepLabelContainer>
    );
};

GlassStepLabel.displayName = 'GlassStepLabel'; 