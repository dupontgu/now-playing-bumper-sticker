/* 
 * Project Bumper
 * Author: Guy Dupont
 */

// Include Particle Device OS APIs
#include "Particle.h"

#define SERVICE_UUID        "3a40992e-127b-11ed-861d-0242ac120003"
#define CHARACTERISTIC_UUID "3a40992e-127b-11ed-861d-0242ac120004"

// Run the application and system concurrently in separate threads
SYSTEM_THREAD(ENABLED);

// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

const BleUuid service(SERVICE_UUID);
BleCharacteristic characteristic("ticker", BleCharacteristicProperty::READ, CHARACTERISTIC_UUID, service);

void playDataHandler(const char *event, const char *data);

static void onDataReceived(const uint8_t* data, size_t len, const BlePeerDevice& peer, void* context) {
  // should never happen ideally
  Log.info("blerpp");
}

// setup() runs once, when the device is first turned on
void setup() {
  BLE.on();
  // Put initialization like pinMode and begin functions here
  BLE.addCharacteristic(characteristic);
  BleAdvertisingData advData;
  advData.appendServiceUUID(service);
  advData.appendLocalName("bt");
  BLE.advertise(&advData);
  // set handler to receive webhook response
  Particle.subscribe("hook-response/fetch", playDataHandler, MY_DEVICES);
}

void loop() {
  // this will trigger a webhook call to val town on Particle's backend
  Particle.publish("fetch");
  delay(10000);
}

void playDataHandler(const char *event, const char *data) {
  // take the data from the webhook response and plop it right into the ble characteristic.
  Log.info(data);
  characteristic.setValue(data);
}
