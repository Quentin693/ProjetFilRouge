import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';



const ROME_LAT = 41.9028;
const ROME_LNG = 12.4964;
const ROME_DELTA = 0.01;
const ROME_DELTA_LNG = 0.01;

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ROME_LAT,
          longitude: ROME_LNG,
          latitudeDelta: ROME_DELTA,
          longitudeDelta: ROME_DELTA_LNG,
        }}
      >
        <Marker
          coordinate={{ latitude: ROME_LAT, longitude: ROME_LNG }}
          title="Rome"
        >
          <Image
            source={require('/Users/quentinho/Projets/EEMI/ProjetFilRouge/FilRougeNative/assets/rome.png')}
            style={{ width: 20, height: 20 }}
          />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});