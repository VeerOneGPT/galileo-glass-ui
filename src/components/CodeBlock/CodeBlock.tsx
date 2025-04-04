import React from 'react';
import styled from 'styled-components';

const StyledPre = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundVariant || '#1e1e1e'};
  color: ${({ theme }) => theme.colors.textPrimary || '#ffffff'};
  border-radius: ${({ theme }) => theme.shape?.borderRadius || 4}px;
  padding: 1rem;
  margin: 1rem 0;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledCode = styled.code`
  font-family: inherit;
`;

export interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language,
  showLineNumbers = true,
}) => {
  return (
    <StyledPre className={className}>
      <StyledCode>
        {children}
      </StyledCode>
    </StyledPre>
  );
};

export default CodeBlock; 