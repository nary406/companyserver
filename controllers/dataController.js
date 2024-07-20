const { getDatabase, ref, query, orderByKey, startAt, get } = require('firebase/database');
const firebaseConfig = require('../config/firebaseConfig');
const { initializeApp } = require('firebase/app');
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//@params No parameter
//@GET request

const getAlldevices = async (req, res, next) => {
    const mail = [
        "ftb001- Kollar", "stb001- Modiyur", "nrmsv2f001- Ananthapuram",
        "rmsv3_001- Vengur", "rmsv3_002- Sithalingamadam", "rmsv32_001- Keelathalanur",
        "rmsv33_001- Perumukkal", "rmsv33_002- Agalur", "rmsv33_005- Saram",
        "rmsv34_002- Pootai", "rmsv35_002- Puthirampattu", "rmsv35_003- Vadalur", "rmsv4_001- Melmalaiyanur",
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

            for (const record of records) {
                const timestamp = Number(record.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && emailPrefix === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal) * 1000);
                const currentTime = Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false }).format(t));
                const solarPower = record.val().solarVoltage * record.val().solarCurrent;
                
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

        const t = Math.ceil(Date.now() / 1000);
        const workingDevices = results.filter(result => result.record > 0 && Math.abs(result.additionalData.tValue - t) <= 1800);
        const notWorkingDevices = results.filter(result => result.record === 0 || Math.abs(result.additionalData.tValue - t) > 1800);

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

            let prevTime = 24;
            let timeCount = 0;
            let p1Value = 0;
            let p1ValueTot = 0;
            let flag = 0;

            for (const record of records) {
                const timestamp = Number(record.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && mail === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal) * 1000);
                const currentTime = Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false }).format(t));
                const solarPower = record.val().solarVoltage * record.val().solarCurrent;
                
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

            p1ValueTot = (p1ValueTot / 1000).toFixed(2);
            res.status(200).json({ message: 'Data processed successfully', data: { p1ValueTot } });
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
            const curr = new Date(new Date());
            const dateOrg = curr.toISOString().substring(0, 10);
            const uniValue = Math.floor(new Date(dateOrg).getTime() / 1000) - 19800;
            const timestamp24HoursAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
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

            let prevTime = 24;
            let timeCount = 0;
            let p1Value = 0;
            let p1ValueTot = 0;
            let flag = 0;

            for (const record of records) {
                const timestamp = Number(record.key);
                let timeVal = 0;
                if (timestamp > 1663660000 && mail === "ftb001") {
                    timeVal = 5400 - 230;
                }
                const t = new Date((timestamp + timeVal) * 1000);
                const currentTime = Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hour12: false }).format(t));
                const solarPower = record.val().solarVoltage * record.val().solarCurrent;
                
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

            p1ValueTot = (p1ValueTot / 1000).toFixed(2);
            res.status(200).json({ message: "DB updated", data: { p1ValueTot, ...snapshot.val() } });
        } else {
            res.status(400);
            next({ message: "selectedItem is empty" });
        }
    } catch (err) {
        res.status(500);
        next(err);
    }
};
