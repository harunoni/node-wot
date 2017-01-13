import HttpServer from '../protocols/http/http-server'
import CoapServer from '../protocols/coap/coap-server'
import AssetResourceListener from '../resource-listeners/asset-resource-listener'

var res1 = new AssetResourceListener("Hello World");
var res2 = new AssetResourceListener("Goodbye World")

var hServer = new HttpServer(8081);
hServer.addResource("/test", res1);
hServer.addResource("/exit", res2);
hServer.start();
console.log("HTTP listening on port 8081");

var cServer = new CoapServer();
cServer.addResource("/test", res1);
cServer.addResource("/exit", res2);
cServer.start();
console.log("CoAP listening on port 5683");