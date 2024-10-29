const express = require('express')
const http = require('http')


const app = express();
app.use(express.json()); // Middleware to parse JSON body

app.listen(3000, () => console.log('Server is listening on port 3000'));

function serve_proxy(target_url, res) {
    //fairly certain theres a better way to do this, but I'll keep it in because i think its funny
    // unfortunatley this means it can only handle .com domained apis/websites, for now...
    target_host = target_url.split('.com/')[0] + ".com"
    target_path = '/' + target_url.split('.com/')[1]

    console.log('target host ' + target_host)
    console.log('target path ' + target_path)

    const options = {
        host: target_host,
        path: target_path,
        method: 'GET',
    };

    const request = http.request(options, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
            data += chunk; // Accumulate the data
        });

        proxyRes.on('end', () => {
            if (proxyRes.statusCode === 200) {
                res.status(200).send(data); // Send data back to the client
            } else {
                res.status(proxyRes.statusCode).send({ error: 'Error in proxy request' });
            }
        });
    });

    request.on('error', (e) => {
        res.status(500).send({ error: `Proxy request failed: ${e.message}` });
    });

    request.end(); // End the request
}

app.post('/proxy', (req, res) => {
    const url = req.body.url; // URL passed in request body

    console.log('URL received:', url);

    if (url) {
        serve_proxy(url, res); // Call serve_proxy with response handler
    } else {
        res.status(400).send({ error: 'No URL provided' });
    }
});
