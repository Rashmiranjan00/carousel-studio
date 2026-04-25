import React from 'react';
import styles from './Panel.module.css';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ title, children, noPadding, className, ...props }) => {
  return (
    <div className={`${styles.panel} ${className || ''}`} {...props}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : styles.content}>
        {children}
      </div>
    </div>
  );
};
