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

app.delete("/test/:id", (req, res) => {
    let {id} = req.params;

    if (!myMap.has(parseInt(id))) {
        return res.status(404).json({
            "error" : "해당하는 번호가 없습니다."
        })
    }
    
    myMap.delete(parseInt(id));
    res.status(200).json({
        "Status" : "Delete Success"
    })
})

app.delete("/test", (req, res) => {

    if (myMap.size == 0) {
        res.status(404).json({
            "error" : "삭제할 데이터가 없습니다."
        })
    }

    let previousDataSize = myMap.size

    myMap.clear();
    res.status(200).json({
        "Status" : "All Data Delete Success",
        "deletedCount" : previousDataSize
    })

})

app.put("/test/:id", (req, res) => {
    let {id} = req.params;
    let updatedData = req.body;

    if (!myMap.has(parseInt(id))) {
        return res.status(404).json({
            "error" : "해당하는 번호가 없습니다."
        })
    }

    if (!updatedData.number) {
        return res.status(400).json({
            'error' : "필수 필드가 누락되었습니다."
        })
    }

    myMap.set(parseInt(id), updatedData.number);
    res.status(200).json({
        "Id" : id,
        "Value" : updatedData.number,
        "Status" : "Update Success"
    })
})