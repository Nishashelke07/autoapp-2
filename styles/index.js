// globalStyles.js

import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { AppContext } from '../context';

const globalStyles = () => {
//   const { colorScheme } = useContext(AppContext);
const colorScheme = true;

  const lightTheme = {
    backgroundColor: 'lightblue',
    textColor: 'black',
  };

  const darkTheme = {
    backgroundColor: 'darkblue',
    textColor: 'white',
  };

  const theme = colorScheme ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 7
    },
    text: {
      fontSize: 18,
      color: theme.textColor,
    },
    lightTheme: {
        backgroundColor: '#C0C5CE'
    },
    darkTheme: {
        // backgroundColor: '#26282A'
    }
  });
};

export default globalStyles();