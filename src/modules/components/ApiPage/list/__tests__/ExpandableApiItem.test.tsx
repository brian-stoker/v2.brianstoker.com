import React from 'react';

const ExpandableApiItem = (props) => {
  const {
    children,
    className,
    description,
    displayOption,
    id,
    isExtendable = true,
    note,
    title,
    type,
    ...other
  } = props;

  return (
    <div>
      {children}
    </div>
  );
};

export default ExpandableApiItem;