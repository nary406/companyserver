const { getDatabase, ref, query, orderByKey, startAt, get } = require('firebase/database');
const firebaseConfig = require('../config/firebaseConfig')
const { initializeApp } = require('firebase/app');
const { constants } = require('../constants/statusCode');
const errorHandler = require('../middlewares/errorHandler');
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//@params No parameter
//@GET request

const getAlldevices = async (req, res, next) => {
    const mail = [
        "ftb001- Kollar", "stb001- Modiyur", "nrmsv2f001- Ananthapuram",
        "rmsv3_001- Vengur", "rmsv3_002- Sithalingamadam", "rmsv32_001- Keelathalanur",
        "rmsv33_001- Perumukkal", "rmsv33_002- Agalur", "rmsv33_005- Saram",
        "rmsv34_002- Pootai", "rmsv35_002- Puthirampattu", "rmsv4_001- Melmalaiyanur",
        "rmsv4_002- Thandavankulam"
    ];

    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timestamp24HoursAgo = currentTimestamp - (24 * 60 * 60);
        const uniValue = currentTimestamp - 19800;

        const results = await Promise.all(mail.map(async (email) => {
            const emailPrefix = email.split('-')[0].trim();
            const dataRef = ref(db, `data/${emailPrefix}/timestamp`);
            const queryRef = query(dataRef, orderByKey(), startAt("" + timestamp24HoursAgo));
            const snapshot = await get(queryRef);

            const records = [];
            let k = 0;

            snapshot.forEach((childSnapshot) => {
                if (emailPrefix === "ftb001" && childSnapshot.key > 1663660000) {
                    k = 5400;
                }
                if (childSnapshot.key > uniValue - k && childSnapshot.key < uniValue + 86400 - k) {
                    records.push(childSnapshot);
                }
            });

            let prevTime = 24;
            let timeCount = 0;
            let p1Value = 0;
            let p1ValueTot = 0;
            let flag = 0;

            for (const snapshot of records) {
                const timestamp = Number(snapshot.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && mail === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal) * 1000);
                const dateForCalculation = new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false }).format(t);
                const currentTime = Number(dateForCalculation);
                const solarPower = snapshot.val().solarVoltage * snapshot.val().solarCurrent;
                if (!isNaN(solarPower)) {
                    if (prevTime === currentTime) {
                        timeCount++;
                        p1Value += solarPower;
                    } else {
                        if (flag === 1) {
                            p1ValueTot += p1Value / timeCount;

                            timeCount = 1;
                            p1Value = solarPower;

                            prevTime = currentTime;
                        } else {
                            flag = 1;
                            timeCount = 1;
                            p1Value = solarPower;
                            prevTime = currentTime;
                        }
                    }
                }
            }

            const additionalDataRef = ref(db, `data/${emailPrefix}/latestValues`);
            const additionalData = await get(additionalDataRef);

            p1ValueTot = (p1ValueTot / 1000).toFixed(2);
            const record = records.length;
            return {
                email,
                record,
                p1ValueTot,
                additionalData: additionalData.val(),
            };
        }));

        const workingDevices = results.filter(result => result.record > 0);
        const notWorkingDevices = results.filter(result => result.record === 0);

        res.status(200).json({ message: "Successful", data: { workingDevices, notWorkingDevices } });
    } catch (error) {
        res.status(500);
        next(error);
    }
};


//@params selectedItem, Date
//@POST request

const getDate = async (req, res, next) => {
    try {
        const mail = req.body.selectedItem;
        const date = req.body.date;
        if (mail && date) {
            const curr = new Date(date);
            const dateOrg = curr.toISOString().substring(0, 10);
            const uniValue = Math.floor(new Date(dateOrg).getTime() / 1000) - 19800;
            const timestamp24HoursAgo = uniValue - (24 * 60 * 60);
            const dataRef = ref(db, `data/${mail}/timestamp`);
            const queryRef = query(dataRef, orderByKey(), startAt("" + timestamp24HoursAgo));
            const snapshots = await get(queryRef);
            const records = [];
            let k = 0;
            snapshots.forEach((childSnapshot) => {
                if (mail === "ftb001" && childSnapshot.key > 1663660000) {
                    k = 5400;
                }
                if (childSnapshot.key > uniValue - k && childSnapshot.key < uniValue + 86400 - k) {
                    records.push(childSnapshot);
                }
            });

            let axisValueCount = 0;
            const myArray1 = [];
            const myArray2 = [];
            const myArray3 = [];
            const myArray4 = [];
            const myArray5 = [];
            const myArray6 = [];
            const myArray7 = [];
            const myArray8 = [];
            const myArray9 = [];
            const myArray10 = [];
            const myArray11 = [];
            const myArray12 = [];
            let iterVal = 0;

            const dataCharts = Object.entries(records).map(([key, value]) => {
                const timestamp = Number(value.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && mail === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal + 19800) * 1000);
                const dateForGraph = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(t);
                let dateForGraphVal = "";
                if (dateForGraph.split(':')[0] === 24) {
                    dateForGraphVal = "00:" + dateForGraph.split(':')[1];
                }
                else {
                    dateForGraphVal = dateForGraph;
                }

                axisValueCount++;

                if (axisValueCount > 10) {
                    myArray1.push(Math.abs(value.val().solarVoltage));
                    myArray2.push(Math.abs(value.val().solarCurrent));
                    myArray3.push(Math.abs(value.val().solarVoltage * value.val().solarCurrent));

                    myArray4.push(Math.abs(value.val().inverterVoltage));
                    myArray5.push(Math.abs(value.val().inverterCurrent));
                    myArray6.push(Math.abs(value.val().inverterVoltage * value.val().inverterCurrent));

                    myArray7.push(Math.abs(value.val().gridVoltage));
                    myArray8.push(Math.abs(value.val().gridCurrent));
                    myArray9.push(Math.abs(value.val().gridVoltage * value.val().gridCurrent));

                    myArray10.push(Math.abs(value.val().batteryVoltage));
                    myArray11.push(Math.abs(value.val().batteryCurrent));
                    myArray12.push(Math.abs(value.val().batteryVoltage * value.val().batteryCurrent));

                    let sum1 = 0;
                    let sum2 = 0;
                    let sum3 = 0;
                    let sum4 = 0;
                    let sum5 = 0;
                    let sum6 = 0;
                    let sum7 = 0;
                    let sum8 = 0;
                    let sum9 = 0;
                    let sum10 = 0;
                    let sum11 = 0;
                    let sum12 = 0;

                    for (let i = iterVal; i < iterVal + 10; i++) {
                        sum1 += myArray1[i];
                        sum2 += myArray2[i];
                        sum3 += myArray3[i];
                        sum4 += myArray4[i];
                        sum5 += myArray5[i];
                        sum6 += myArray6[i];
                        sum7 += myArray7[i];
                        sum8 += myArray8[i];
                        sum9 += myArray9[i];
                        sum10 += myArray10[i];
                        sum11 += myArray11[i];
                        sum12 += myArray12[i];
                    }
                    iterVal++;
                }

                return {
                    ccAxisXValue: dateForGraphVal,
                    SolarVoltage: Math.floor(Math.abs(value.val().solarVoltage)),
                    SolarCurrent: Math.abs(value.val().solarCurrent).toFixed(2),
                    SolarPower: Math.floor(Math.abs(value.val().solarVoltage * value.val().solarCurrent)),

                    InverterVoltage: Math.floor(Math.abs(value.val().inverterVoltage)),
                    InverterCurrent: Math.abs(value.val().inverterCurrent).toFixed(2),
                    InverterPower: Math.floor(Math.abs(value.val().inverterVoltage * value.val().inverterCurrent)),

                    GridVoltage: Math.floor(Math.abs(value.val().gridVoltage)),
                    GridCurrent: Math.abs(value.val().gridCurrent).toFixed(2),
                    GridPower: Math.floor(Math.abs(value.val().gridVoltage * value.val().gridCurrent)),

                    BatteryVoltage: Math.floor(Math.abs(value.val().batteryVoltage)),
                    BatteryCurrent: Math.abs(value.val().batteryCurrent),
                    BatteryPower: Math.floor(Math.abs(value.val().batteryVoltage * value.val().batteryCurrent)),
                };
            });
            res.status(200).json({ message: 'Data processed successfully', data: { dataCharts } });
        } else {
            res.status(400);
            next({ message: "Either values are empty" });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
};


//@params selectedItem
//@POST request

const postDB = async (req, res, next) => {
    try {
        const mail = req.body.selectedItem;
        if (mail) {
            const databaseRef = ref(db, `data/${mail}/latestValues`);
            const snapshot = await get(databaseRef);
            var curr = new Date(new Date());
            curr.setDate(curr.getDate());
            console.log(curr);
            const dateOrg = curr.toISOString().substring(0, 10);
            const caldate = dateOrg;
            const uniValue = parseInt((new Date(caldate) / 1000).toFixed(0)) - 19800;
            console.log(uniValue);
            let currentTimestampVal;
            let timestamp24HoursAgo;
            if (caldate) {
                currentTimestampVal = Math.floor(Date.now() / 1000);
            }
            timestamp24HoursAgo = currentTimestampVal - (24 * 60 * 60);
            const dataRef = ref(db, `data/${mail}/timestamp`);
            const queryRef = query(dataRef, orderByKey(), startAt("" + timestamp24HoursAgo));

            const snapshots = await get(queryRef);

            const records = [];
            let k = 0;
            snapshots.forEach((childSnapshot) => {
                if (mail === "ftb001" && childSnapshot.key > 1663660000) {
                    k = 5400;
                }
                if (childSnapshot.key > uniValue - k && childSnapshot.key < uniValue + 86400 - k) {
                    records.push(childSnapshot);
                }
            });


            let p1Value = 0;
            let p2Value = 0;
            let p3Value = 0;
            let p1ValueTot = 0;
            let p2ValueTot = 0;
            let p3ValueTot = 0;
            let axisValueCount = 0;
            const myArray1 = [];
            const myArray2 = [];
            const myArray3 = [];
            const myArray4 = [];
            const myArray5 = [];
            const myArray6 = [];
            const myArray7 = [];
            const myArray8 = [];
            const myArray9 = [];
            const myArray10 = [];
            const myArray11 = [];
            const myArray12 = [];
            let iterVal = 0;
            let prevTime = 24;
            let flag = 0;

            const dataCharts = Object.entries(records).map(([key, value]) => {
                const timestamp = Number(value.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && mail === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal + 19800) * 1000);
                const dateForGraph = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(t);
                let dateForGraphVal = "";
                if (dateForGraph.split(':')[0] === 24) {
                    dateForGraphVal = "00:" + dateForGraph.split(':')[1];
                }
                else {
                    dateForGraphVal = dateForGraph;
                }

                const solarPower = value.val().solarVoltage * value.val().solarCurrent;
                const gridPower = value.val().gridVoltage * value.val().gridCurrent;
                const inverterPower = value.val().inverterVoltage * value.val().inverterCurrent;
                const currentTime = Number(dateForGraphVal);
                if (!isNaN(solarPower) && !isNaN(gridPower) && !isNaN(inverterPower)) {
                    if (prevTime === currentTime) {
                        timeCount++;
                        p1Value += solarPower;
                        p2Value += gridPower;
                        p3Value += inverterPower;
                    } else {
                        if (flag === 1) {
                            p1ValueTot += p1Value / timeCount;
                            p2ValueTot += p2Value / timeCount;
                            p3ValueTot += p3Value / timeCount;

                            timeCount = 1;
                            p1Value = solarPower;
                            p2Value = gridPower;
                            p3Value = inverterPower;

                            prevTime = currentTime;
                        } else {
                            flag = 1
                            timeCount = 1;
                            p1Value = solarPower;
                            p2Value = gridPower;
                            p3Value = inverterPower;
                            prevTime = currentTime;
                        }
                    }
                }

                axisValueCount++;

                if (axisValueCount > 10) {
                    myArray1.push(Math.abs(value.val().solarVoltage));
                    myArray2.push(Math.abs(value.val().solarCurrent));
                    myArray3.push(Math.abs(value.val().solarVoltage * value.val().solarCurrent));

                    myArray4.push(Math.abs(value.val().inverterVoltage));
                    myArray5.push(Math.abs(value.val().inverterCurrent));
                    myArray6.push(Math.abs(value.val().inverterVoltage * value.val().inverterCurrent));

                    myArray7.push(Math.abs(value.val().gridVoltage));
                    myArray8.push(Math.abs(value.val().gridCurrent));
                    myArray9.push(Math.abs(value.val().gridVoltage * value.val().gridCurrent));

                    myArray10.push(Math.abs(value.val().batteryVoltage));
                    myArray11.push(Math.abs(value.val().batteryCurrent));
                    myArray12.push(Math.abs(value.val().batteryVoltage * value.val().batteryCurrent));

                    let sum1 = 0;
                    let sum2 = 0;
                    let sum3 = 0;
                    let sum4 = 0;
                    let sum5 = 0;
                    let sum6 = 0;
                    let sum7 = 0;
                    let sum8 = 0;
                    let sum9 = 0;
                    let sum10 = 0;
                    let sum11 = 0;
                    let sum12 = 0;

                    for (let i = iterVal; i < iterVal + 10; i++) {
                        sum1 += myArray1[i];
                        sum2 += myArray2[i];
                        sum3 += myArray3[i];
                        sum4 += myArray4[i];
                        sum5 += myArray5[i];
                        sum6 += myArray6[i];
                        sum7 += myArray7[i];
                        sum8 += myArray8[i];
                        sum9 += myArray9[i];
                        sum10 += myArray10[i];
                        sum11 += myArray11[i];
                        sum12 += myArray12[i];
                    }
                    iterVal++;
                }

                axisValueCount++;

                if (axisValueCount > 10) {
                    myArray1.push(Math.abs(value.val().solarVoltage));
                    myArray2.push(Math.abs(value.val().solarCurrent));
                    myArray3.push(Math.abs(value.val().solarVoltage * value.val().solarCurrent));

                    myArray4.push(Math.abs(value.val().inverterVoltage));
                    myArray5.push(Math.abs(value.val().inverterCurrent));
                    myArray6.push(Math.abs(value.val().inverterVoltage * value.val().inverterCurrent));

                    myArray7.push(Math.abs(value.val().gridVoltage));
                    myArray8.push(Math.abs(value.val().gridCurrent));
                    myArray9.push(Math.abs(value.val().gridVoltage * value.val().gridCurrent));

                    myArray10.push(Math.abs(value.val().batteryVoltage));
                    myArray11.push(Math.abs(value.val().batteryCurrent));
                    myArray12.push(Math.abs(value.val().batteryVoltage * value.val().batteryCurrent));

                    let sum1 = 0;
                    let sum2 = 0;
                    let sum3 = 0;
                    let sum4 = 0;
                    let sum5 = 0;
                    let sum6 = 0;
                    let sum7 = 0;
                    let sum8 = 0;
                    let sum9 = 0;
                    let sum10 = 0;
                    let sum11 = 0;
                    let sum12 = 0;

                    for (let i = iterVal; i < iterVal + 10; i++) {
                        sum1 += myArray1[i];
                        sum2 += myArray2[i];
                        sum3 += myArray3[i];
                        sum4 += myArray4[i];
                        sum5 += myArray5[i];
                        sum6 += myArray6[i];
                        sum7 += myArray7[i];
                        sum8 += myArray8[i];
                        sum9 += myArray9[i];
                        sum10 += myArray10[i];
                        sum11 += myArray11[i];
                        sum12 += myArray12[i];
                    }
                    iterVal++;
                }

                return {
                    ccAxisXValue: dateForGraphVal,
                    SolarVoltage: Math.floor(Math.abs(value.val().solarVoltage)),
                    SolarCurrent: Math.abs(value.val().solarCurrent).toFixed(2),
                    SolarPower: Math.floor(Math.abs(value.val().solarVoltage * value.val().solarCurrent)),

                    InverterVoltage: Math.floor(Math.abs(value.val().inverterVoltage)),
                    InverterCurrent: Math.abs(value.val().inverterCurrent).toFixed(2),
                    InverterPower: Math.floor(Math.abs(value.val().inverterVoltage * value.val().inverterCurrent)),

                    GridVoltage: Math.floor(Math.abs(value.val().gridVoltage)),
                    GridCurrent: Math.abs(value.val().gridCurrent).toFixed(2),
                    GridPower: Math.floor(Math.abs(value.val().gridVoltage * value.val().gridCurrent)),

                    BatteryVoltage: Math.floor(Math.abs(value.val().batteryVoltage)),
                    BatteryCurrent: Math.abs(value.val().batteryCurrent).toFixed(2),
                    BatteryPower: Math.floor(Math.abs(value.val().batteryVoltage * value.val().batteryCurrent)),
                };
            });

            p1ValueTot = (p1ValueTot / 1000).toFixed(2);
            p2ValueTot = (p2ValueTot / 1000).toFixed(2);
            p3ValueTot = (p3ValueTot / 1000).toFixed(2);
            res.status(200).json({ message: 'Data processed successfully', data: { caldate, snapshot, dataCharts, p1ValueTot, p2ValueTot, p3ValueTot } });
        }
        else {
            res.status(400);
            next({ message: "value is empty" });;
        }
    } catch (error) {
        res.status(500);
        next(error);
    }

}




module.exports = { getAlldevices, getDate, postDB };