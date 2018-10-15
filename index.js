const upnp = require('nat-upnp');
const express = require('express');
const Gpio = require('onoff').Gpio;

let led;


// Gpio 접근 권한에 따라
if (Gpio.accessible) {
  led = new Gpio(26, 'out');
} else {
  led = {
    writeSync: (value) => {
      console.log('virtual led now uses value: ' + value);
    }
  };
}

var client = upnp.createClient();
var app = express();



// express 요청 별 화면 구성
app.get('/',(req,res) => res.sendfile('index.html'))

app.get('/on',function (req,res) {
  led.writeSync(Gpio.HIGH);
  res.sendfile('index.html');
})

app.get('/off',function (req,res) {
  led.writeSync(Gpio.LOW);
  res.sendfile('index.html');
})

// 기존의 포트 포워딩 제거
client.portUnmapping({
  public: 12345
});

// 포트포워딩 요청
client.portMapping({
  public: 12345,
  private: 54321,
  ttl: 10
}, function(err) {
});

//외부망 IP 수집
client.externalIp(function(err, ip) {
  //요청된 포트포워딩 수집
  client.getMappings(function(err, results) {
    console.log(results)
    // TODO: 복수의 포트포워딩이 있을시 해당 장비의 포트포워딩 정보만 수집 하도록 해야한다.
    pulic_port = results[0].public.port;
    private_port = results[0].private.port;
    // express 포트 열기
    app.listen(private_port,()=> console.log('server is running on '+ip+':'+pulic_port))
  });
});
