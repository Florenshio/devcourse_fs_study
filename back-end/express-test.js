const express = require("express");
const app = express();
const myMap = new Map();

app.use(express.json())
app.listen(1234);
var id = 1;

myMap.set(id++, "one");
myMap.set(id++, "two");
myMap.set(id++, "three");

app.get("/test/:id", (req, res) => {
    let {id} = req.params;

    let value = myMap.get(parseInt(id));

    if (value == undefined) {
        res.send("Not Found");
    } else {
        res.json({
            "Id": id,
            "Value": value
        })
    }
})

app.post("/test/post-number", (req, res) => {
    const requested_value = req.body.number;

    myMap.set(id++, requested_value);

    res.json({
        "ID" : id - 1,
        "Value" : myMap.get(parseInt(id-1)),
        "Status" : "Success"
    });

})