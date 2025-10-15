import * as React from "react";
import {Text, StyleSheet, View} from "react-native";
import { Svg, Path, Rect } from 'react-native-svg';

// SVG components to replace the imported SVGs
const Cellularconnection = (props) => (
  <Svg width={props.width} height={props.height} viewBox="0 0 19 12" {...props}>
    <Path
      d="M17 2.66675H18.6667V10.6667H17V2.66675ZM12.3333 4.66675H14V10.6667H12.3333V4.66675ZM7.66667 6.66675H9.33333V10.6667H7.66667V6.66675ZM3 8.66675H4.66667V10.6667H3V8.66675Z"
      fill="black"
    />
  </Svg>
);

const Wifi = (props) => (
  <Svg width={props.width} height={props.height} viewBox="0 0 17 12" {...props}>
    <Path
      d="M8.5 3.1C10.3 3.1 12 3.7 13.4 4.8L14.5 3.6C12.8 2.3 10.7 1.5 8.5 1.5C6.3 1.5 4.2 2.3 2.5 3.6L3.6 4.8C4.9 3.7 6.6 3.1 8.5 3.1ZM4.7 6C5.8 5.1 7.1 4.7 8.5 4.7C9.9 4.7 11.2 5.1 12.3 6L13.4 4.8C12 3.7 10.3 3 8.5 3C6.7 3 5 3.7 3.6 4.8L4.7 6ZM6.7 8.1C7.3 7.7 7.9 7.5 8.5 7.5C9.1 7.5 9.7 7.7 10.3 8.1L8.5 10L6.7 8.1Z"
      fill="black"
    />
  </Svg>
);

const Cap = (props) => (
  <Svg width={props.width} height={props.height} viewBox="0 0 1 4" {...props}>
    <Rect width="1" height="4" fill="black" />
  </Svg>
);

const StatusBarIPhone = () => {
  return (
    <View style={styles.statusBar}>
      <View style={styles.frame}>
        <View style={[styles.time, styles.timeFlexBox]}>
          <Text style={styles.time1}>9:41</Text>
        </View>
        <View style={[styles.dynamicIslandSpacer, styles.timeFlexBox]} />
        <View style={[styles.levels, styles.timeFlexBox]}>
          <Cellularconnection style={styles.cellularConnectionIcon} width={19} height={12} />
          <Wifi style={styles.wifiIcon} width={17} height={12} />
          <View style={styles.battery}>
            <View style={[styles.border, styles.borderPosition]} />
            <Cap style={[styles.capIcon, styles.borderPosition]} />
            <View style={[styles.capacity, styles.borderPosition]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timeFlexBox: {
    justifyContent: "center",
    alignItems: "center"
  },
  borderPosition: {
    left: "50%",
    position: "absolute"
  },
  time1: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    fontFamily: "Arial",
    color: "#000",
    textAlign: "center"
  },
  time: {
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: "row",
    justifyContent: "center",
    flex: 1
  },
  dynamicIslandSpacer: {
    width: 124,
    height: 10
  },
  cellularConnectionIcon: {},
  wifiIcon: {},
  border: {
    height: "100%",
    marginLeft: -13.65,
    top: "0%",
    bottom: "0%",
    borderRadius: 4,
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    width: 25,
    opacity: 0.35
  },
  capIcon: {
    height: "31.54%",
    marginLeft: 12.35,
    top: "36.78%",
    bottom: "31.68%",
    maxHeight: "100%",
    width: 1,
    opacity: 0.4
  },
  capacity: {
    height: "69.23%",
    marginLeft: -11.65,
    top: "15.38%",
    bottom: "15.38%",
    borderRadius: 3,
    backgroundColor: "#000",
    width: 21
  },
  battery: {
    width: 27,
    height: 13
  },
  levels: {
    paddingLeft: 6,
    paddingRight: 16,
    gap: 7,
    flexDirection: "row",
    justifyContent: "center",
    flex: 1
  },
  frame: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    gap: 0,
    alignItems: "center",
    flexDirection: "row"
  },
  statusBar: {
    width: "100%",
    height: 54,
    paddingTop: 20,
    flex: 0
  }
});

export default StatusBarIPhone; 