import React from "react";
import {ContainerStyles,FillerStyless} from '../style'

const ProgressBar = (props) => {
  const {completed } = props;
  return (
    <ContainerStyles>
      <FillerStyless completed={completed}>
      </FillerStyless>
    </ContainerStyles>
  );
};

export default ProgressBar;