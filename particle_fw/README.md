This is the firmware that runs on the Particle Boron dev board, which sits inside my car.
Its job is to fetch the "now plaing" song/artist data and relay it to the bumper sticker via Bluetooth.

The app periodically publishes a message ("fetch") to Particle's backend, which has a webhook configured to fetch the now playing data from val.town each time it receieves that message. The app is subscribed to the result of that webhook call, so it's basically just a proxy to my code on val.town.

The app was compiled for Boron FW version 6.1.1.