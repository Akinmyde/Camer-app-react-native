import * as React from "react";
import {
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image
} from "react-native";
import { ScreenOrientation } from "expo";
import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import Swiper from "react-native-swiper";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraType: Camera.Constants.Type.back,
      flashMode: Camera.Constants.FlashMode.on,
      whiteBalance: Camera.Constants.WhiteBalance.auto,
      hasPermission: false,
      capturing: false,
      imageUri: "",
      captures: [
        { uri: "https://picsum.photos/id/1/200/300" },
        { uri: "https://picsum.photos/id/726/200/300" }
      ],
      displayImage: false
    };
  }

  async componentDidMount() {
    await this.askPermission();
    this.getScreenSize();
  }

  getScreenSize = async () => {
    if (Platform.OS === "android") {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    }
    if (Platform.OS === "ios") {
      await ScreenOrientation.lockAsync(ScreenOrientation.SizeClassIOS.REGULAR);
    }
  };

  askPermission = async () => {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    const hasPermission =
      camera.status === "granted" && audio.status === "granted";
    this.setState({ hasPermission });
  };

  toggleFlash = () => {
    const flashMode = this.state.flashMode
      ? Camera.Constants.FlashMode.off
      : Camera.Constants.FlashMode.on;
    this.setState({ flashMode });
  };

  toggleCameraType = () => {
    const cameraType =
      this.state.cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back;
    this.setState({ cameraType });
  };

  onPictureSaved = uri => {
    this.setState({ capturing: false });
  };

  takePicture = async () => {
    this.setState({ displayImage: false });
    const { captures } = this.state;
    if (this.camera) {
      const photoData = await this.camera.takePictureAsync({
        onPictureSaved: this.onPictureSaved()
      });
      this.setState({ captures: [...captures, photoData] });
    }
  };

  showImage = uri => {
    this.setState({ displayImage: true, imageUri: uri });
  };

  render() {
    if (this.state.hasPermission === null) return <View />;
    else
      return (
        <React.Fragment>
          {this.state.displayImage && (
            <Swiper showsButtons={true} loop={false}>
              {this.state.captures.map(({ uri }, id) => (
                <Image key={id} source={{ uri }} style={styles.deviceSize} />
              ))}
            </Swiper>
          )}
          {!this.state.displayImage && (
            <View>
              <Camera
                type={this.state.cameraType}
                flashMode={this.state.flashMode}
                style={[styles.preview, styles.deviceSize]}
                ref={ref => (this.camera = ref)}
              />
            </View>
          )}
          <Grid style={styles.bottomToolbar}>
            <Row>
              <Col style={styles.alignCenter}>
                <TouchableOpacity onPress={this.toggleFlash}>
                  <Ionicons
                    name={this.state.flashMode ? "md-flash" : "md-flash-off"}
                    color="white"
                    size={30}
                  />
                </TouchableOpacity>
              </Col>
              <Col size={2} style={styles.alignCenter}>
                <TouchableOpacity onPress={this.takePicture}>
                  <View
                    style={[
                      styles.captureBtn,
                      this.state.capturing && styles.captureBtnActive
                    ]}
                  >
                    {this.state.capturing && (
                      <View style={styles.captureBtnInternal} />
                    )}
                  </View>
                </TouchableOpacity>
              </Col>
              <Col style={styles.alignCenter}>
                <TouchableOpacity onPress={this.toggleCameraType}>
                  <Ionicons name="md-reverse-camera" color="white" size={30} />
                </TouchableOpacity>
              </Col>
            </Row>
          </Grid>
          <ScrollView
            horizontal={true}
            style={[styles.bottomToolbar, styles.galleryContainer]}
          >
            {this.state.captures.length > 0 &&
              this.state.captures.map(({ uri }) => (
                <View style={styles.galleryImageContainer} key={uri}>
                  <TouchableOpacity
                    onPress={() => {
                      this.showImage(uri);
                    }}
                  >
                    <Image source={{ uri }} style={styles.galleryImage} />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        </React.Fragment>
      );
  }
}
