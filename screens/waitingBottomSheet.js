import React, { useRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import ProgressBar from './progressBar';
import BottomSheet from "@gorhom/bottom-sheet";

const WaitingBottomSheet = (props) => {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["100%"], []);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
    >
      <ProgressBar progress={props.progress}/>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
});

export default WaitingBottomSheet;
