const express = require('express')
const app = express()
const path = require('path')
const Router = express.Router()
const sql = require('mssql/msnodesqlv8')
const bodyparser = require('body-parser')
const session = require('express-session')
const multer = require('multer')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './views/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "itsasecret",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// const sql=require('mssql')
var config = {
    server: "DESKTOP-V53CERG\MSSQLSERVER01", // eg:: 'DESKTOP_mjsi\\MSSQLEXPRESS'
    database: "Weavers_Den",
    user: '',      // write your device's name
    password: "",   // write your device's password
   // options: {
   //     trustedConnection: true,
   //     trustServerCertificate: false
   // },
   connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=YOUR-DEVICE-NAME\MSSQLSERVER01;Database=Weavers_Den;Trusted_Connection=yes;",
   driver: "msnodesqlv8",
   port: //write port number

}

app.set('view engine', 'ejs')
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'views')))


Router.get('/q', (req, res) => {
    res.send(result)
})


Router.get('/', (req, res) => {
    sql.connect(config, function (err) {
        if (err) console.log(err)
        else {
            console.log("Connection Successfull")
        }
        var request = new sql.Request();
        //make the query
        var query = `SELECT TOP 5 * FROM Manufacturer WHERE rating > 1 ORDER BY rating DESC`
        request.query(query, (err, record) => {
            if (err) console.log(err)
            const datas = record.recordset
            if (req.session.username && req.session.role == 'C') {
                res.render('index', { data: datas, check: 1 })
            }
            else if (req.session.username && req.session.role == 'M') {
                res.render('index', { data: datas, check: 2 })
            }
            else {
                res.render('index', { data: datas, check: 0 })
            }
        })
    })
})


Router.get('/home', (req, res) => {
    sql.connect(config, function (err) {
        if (err) console.log(err)
        else {
            console.log("Connection Successfull")
        }
        var request = new sql.Request();
        //make the query
        var query = `SELECT TOP 5 * FROM Manufacturer WHERE rating > 1 ORDER BY rating DESC`
        request.query(query, (err, record) => {
            if (err) console.log(err)
            const datas = record.recordset
            if (req.session.username && req.session.role == 'C') {
                res.render('index', { data: datas, check: 1 })
            }
            else if (req.session.username && req.session.role == 'M') {
                res.render('index', { data: datas, check: 2 })
            }
            else {
                res.render('index', { data: datas, check: 0 })
            }
        })
    })

})
Router.get('/about', (req, res) => {
    res.render('about')
})
Router.get('/contact', (req, res) => {
    res.render('contact')
})

Router.post('/contact', (req, res) => {
    const email = req.body.email
    const message = req.body.message
    console.log(email, message)
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            var request = new sql.Request()
            var querya = `INSERT INTO HelpLine (email,description) values ('${email}','${message}')`;
            request.query(querya, (err) => {
                if (err) throw err
                else {
                    console.log("Record Added Successfully")
                    res.render('contact')
                }
            })
        }
    })
    res.render('contact')
})

Router.get('/login', (req, res) => {
    if (req.session.username) {
        res.redirect('/home')
    }
    else {
        res.render('login')
    }
})

Router.post('/login', (req, res) => {

    const username = req.body.username
    const password = req.body.password

    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection is Successfull")
            var request = new sql.Request();
            //make the query
            var query = `select * from User1 where username='${username}' and password_hash='${password}'`
            request.query(query, (err, record) => {
                if (err) console.log(err)
                const datas = record.recordset
                console.log(datas)
                if (datas.length > 0) {
                    req.session.username = username
                    req.session.role = record.recordset[0]['user_type']
                    const role = record.recordset[0]['user_type']
                    console.log(req.session)
                    //  res.redirect('/editprofile')
                    if (role == 'C') {
                        res.redirect('/consumer')
                    }
                    else if (role == 'M') {
                        res.redirect('/manufuacturerp')
                    }
                }
                else {
                    console.log("No Reccord Found")
                    res.redirect('/login')
                }
            })
        }
    })
})

Router.get('/editprofile', (req, res) => {
    if (req.session.username && req.session.role == 'C') {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                var request = new sql.Request();
                var query = `select user_id from User1 where username='${req.session.username}'`
                request.query(query, (err, record) => {
                    if (err) console.log(err)
                    const datas = record.recordset[0]['user_id']
                    console.log(datas)
                    if (datas) {
                        console.log(datas)
                        var request = new sql.Request()
                        var query = `select * from Consumer where consumer_id=${datas}`
                        request.query(query, (err, row) => {
                            if (err) throw err
                            else {
                                const datas = row.recordset[0]
                                res.render('EditProfile', { data: datas })
                                console.log(datas)
                            }
                        })
                    }
                    else {
                        console.log("No Reccord Found")
                    }
                })
            }
        })
    }
    else if (req.session.username && req.session.role == 'M') {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                var request = new sql.Request();
                var query = `select user_id from User1 where username='${req.session.username}'`
                request.query(query, (err, record) => {
                    if (err) console.log(err)
                    const datas = record.recordset[0]['user_id']
                    console.log(datas)
                    if (datas) {
                        console.log(datas)
                        var request = new sql.Request()
                        var query = `select * from Manufacturer where manufacturer_id=${datas}`
                        request.query(query, (err, row) => {
                            if (err) throw err
                            else {
                                const datas = row.recordset[0]
                                res.render('EditProfile', { data: datas })
                                console.log(datas)
                            }
                        })
                    }
                    else {
                        console.log("No Reccord Found")
                    }
                })
            }
        })
    }
    else {
        res.redirect('/home')
    }
})

Router.post('/update', upload.single('Picture'), (req, res) => {
    const website = req.body.website
    const email = req.body.email
    const companyname = req.body.companyname
    const contactname = req.body.contactname
    const Address = req.body.Address
    const phone = req.body.phone
    const id = req.body.id
    const idm = req.body.idm
    console.log(website, email, companyname, contactname, Address, phone, id)

    if (req.session.role == 'C') {
        if (req.file) {
            sql.connect(config, (err) => {
                if (err) throw err
                else {
                    console.log("Connection is Successfull")
                    const request = new sql.Request()
                    var query = `UPDATE Consumer SET website_url = '${website}', contact_email = '${email}',company_name='${companyname}',contact_name='${contactname}',address='${Address}',contact_phone=${phone}, image='${req.file.originalname}' WHERE consumer_id =${id}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            console.log("values updated")
                            res.redirect('/editprofile')
                        }
                    })
                }
            })

        }
        else {
            sql.connect(config, (err) => {
                if (err) throw err
                else {
                    console.log("Connection is Successfull")
                    const request = new sql.Request()
                    var query = `UPDATE Consumer SET website_url = '${website}', contact_email = '${email}',company_name='${companyname}',contact_name='${contactname}',address='${Address}',contact_phone=${phone} WHERE consumer_id =${id}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            console.log("values updated")
                            res.redirect('/editprofile')
                        }
                    })
                }
            })
        }
    } else {
        if (req.file) {
            sql.connect(config, (err) => {
                if (err) throw err
                else {
                    console.log("Connection is Successfull")
                    const request = new sql.Request()
                    var query = `UPDATE Manufacturer SET website_url = '${website}', contact_email = '${email}',company_name='${companyname}',contact_name='${contactname}',address='${Address}',contact_phone=${phone}, image='${req.file.originalname}' WHERE manufacturer_id =${idm}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            console.log("values updated")
                            res.redirect('/editprofile')
                        }
                    })
                }
            })
        }
        else {
            sql.connect(config, (err) => {
                if (err) throw err
                else {
                    console.log("Connection is Successfull")
                    const request = new sql.Request()
                    var query = `UPDATE Manufacturer SET website_url = '${website}', contact_email = '${email}',company_name='${companyname}',contact_name='${contactname}',address='${Address}',contact_phone=${phone} WHERE manufacturer_id=${idm}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            console.log("values updated")
                            res.redirect('/editprofile')
                        }
                    })
                }
            })
        }
    }
})

Router.get('/logout', (req, res) => {
    if (req.session.username) {
        req.session.destroy();
        res.redirect('/home')
    }
    else {
        res.redirect('/editprofile')
    }
})

Router.get('/signup', (req, res) => {
    if (req.session.username) {
        res.redirect('/home')
    }
    else {
        res.render('signup')
    }
})

//all post request are handled here
Router.post('/signup', (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    sql.connect(config, function (err) {
        if (err) console.log(err)
        else {
            console.log("Connection Successfull")
        }
        var request = new sql.Request();
        //make the query
        var query = `Select * from User1 WHERE username='${username}'`;  // eg : "select * from tbl_name"
        request.query(query, (err, record) => {
            if (err) console.log(err)
            else {
                if (record.recordset.length > 0) {
                    console.log("value already exsist")
                    res.redirect('/login')
                }
                else {
                    var query = "SELECT TOP 1 * FROM User1 ORDER BY user_id DESC"
                    var request = new sql.Request()
                    request.query(query, (err, record) => {
                        const value = (record.recordset[0].user_id) + 1
                        console.log(value)
                        var querry = `insert into User1 (user_id,username,email,password_hash,user_type) values (${value},'${username}','${email}','${password}','A')`
                        var request = new sql.Request()
                        request.query(querry, (err, records) => {
                            if (err) console.log(err)
                            else {
                                console.log("record added successfully")
                                res.redirect('/signup')
                            }
                        })
                    })
                }
            }
        })
    })
})

Router.post('/signupcon', upload.single('Picture'), (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const contactname = req.body.contactname
    const contactemail = req.body.contactemail
    const companyname = req.body.companyname
    const website = req.body.website
    const address = req.body.Address
    const contactphone = req.body.contactphone

    console.log(username, email, password, contactname, contactemail, companyname, website, address, contactphone)

    sql.connect(config, function (err) {
        if (err) console.log(err)
        else {
            console.log("Connection Successfull")
        }
        var request = new sql.Request();
        //make the query
        var query = `Select * from User1 WHERE username='${username}'`;  // eg : "select * from tbl_name"
        request.query(query, (err, record) => {
            if (err) console.log(err)
            else {
                if (record.recordset.length > 0) {
                    console.log("value already exsist")
                    res.redirect('/login')
                }
                else {
                    var value
                    var value1
                    var query = "SELECT TOP 1 * FROM User1 ORDER BY user_id DESC"
                    var request = new sql.Request()
                    request.query(query, (err, record) => {
                        if (err) throw err
                        if (record.recordset <= 0) {
                            value = 1
                        }
                        else {
                            value = (record.recordset[0].user_id) + 1
                        }


                        var querry = `insert into User1 (user_id,username,email,password_hash,user_type) values (${value},'${username}','${email}','${password}','C')`
                        var request = new sql.Request()
                        request.query(querry, (err, records) => {
                            if (err) console.log(err)
                            else {
                                console.log("record added successfully")
                                var query = "SELECT TOP 1 * FROM Consumer ORDER BY CID DESC"
                                var request = new sql.Request()
                                request.query(query, (err, record) => {
                                    if (record.recordset <= 0) {
                                        value1 = 1
                                    }
                                    else {
                                        value1 = (record.recordset[0].CID) + 1
                                        console.log(value1)
                                    }

                                    var querry = `insert into Consumer (CID,consumer_id,password_hash,company_name,contact_name,contact_email,contact_phone,website_url,address,image) values (${value1},${value},'${password}','${companyname}','${contactname}','${contactemail}',${contactphone},'${website}','${address}','${req.file.originalname}')`
                                    var request = new sql.Request()
                                    request.query(querry, (err, records) => {
                                        if (err) console.log(err)
                                        else {
                                            console.log("record added successfully")
                                            res.redirect('/signup')
                                        }
                                    }
                                    )
                                })
                            }
                        })
                    })
                }
            }
        })
    })
})

Router.post('/signupman', upload.single('Picture'), (req, res) => {
    const contactname = req.body.contactname
    const contactemail = req.body.contactemail
    const companyname = req.body.companyname
    const website = req.body.website
    const address = req.body.Address
    const material = req.body.material
    const contactphone = req.body.contactphone
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    console.log(contactname, contactemail, companyname, website, address, material, contactphone, username, email, password)

    sql.connect(config, function (err) {
        if (err) console.log(err)
        else {
            console.log("Connection Successfull")
        }
        var request = new sql.Request();
        //make the query
        var query = `Select * from User1 WHERE username='${username}'`;  // eg : "select * from tbl_name"
        request.query(query, (err, record) => {
            if (err) console.log(err)
            else {
                if (record.recordset.length > 0) {
                    console.log("value already exsist")
                    res.redirect('/login')
                }
                else {
                    var value
                    var value1
                    var query = "SELECT TOP 1 * FROM User1 ORDER BY user_id DESC"
                    var request = new sql.Request()
                    request.query(query, (err, record) => {
                        if (err) throw err
                        if (record.recordset <= 0) {
                            value = 1
                        }
                        else {
                            value = (record.recordset[0].user_id) + 1
                            console.log(value)
                        }

                        var querry = `insert into User1 (user_id,username,email,password_hash,user_type) values (${value},'${username}','${email}','${password}','M')`
                        var request = new sql.Request()
                        request.query(querry, (err, records) => {
                            if (err) console.log(err)
                            else {
                                console.log("record added successfully")
                                var query = "SELECT TOP 1 * FROM Manufacturer ORDER BY MID DESC"
                                var request = new sql.Request()
                                request.query(query, (err, record) => {
                                    if (record.recordset <= 0) {
                                        value1 = 1
                                    }
                                    else {
                                        value1 = (record.recordset[0].MID) + 1
                                        console.log(value1)
                                    }
                                    var querry = `insert into Manufacturer (MID,manufacturer_id,password_hash,company_name,contact_name,contact_email,contact_phone,website_url,address,raw_materials,image) values (${value1},${value},'${password}','${companyname}','${contactname}','${contactemail}',${contactphone},'${website}','${address}','${material}','${req.file.originalname}')`
                                    var request = new sql.Request()
                                    request.query(querry, (err, records) => {
                                        if (err) console.log(err)
                                        else {
                                            console.log("record added successfully")
                                            res.redirect('/signup')
                                        }
                                    }
                                    )
                                })
                            }
                        })
                    })
                }
            }
        })
    })
})

Router.get('/explore', (req, res) => {
    if (!req.session.username) {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                const request = new sql.Request()
                const query = "select * from Manufacturer"
                request.query(query, (err, row) => {
                    if (err) throw err
                    else {
                        res.render('explore', { data: row.recordset, val: 0 })
                    }
                })
            }
        })
    } else {
        var name = req.session.username
        const firstchar = name.charAt(0)
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                const request = new sql.Request()
                const query = `select * from Manufacturer where company_name like '%${firstchar}%'`
                request.query(query, (err, row) => {
                    if (err) throw err
                    else {
                        res.render('explore', { data: row.recordset, val: 0 })
                    }
                })
            }
        })
    }
})


Router.post('/searchexplore', (req, res) => {
    const searchvalue = req.body.searchval
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection is Successfull")
            const request = new sql.Request()
            const query = `select * from Manufacturer where company_name like '%${searchvalue}%'  or raw_materials='${searchvalue}'`
            request.query(query, (err, row) => {
                if (err) throw err
                else {
                    console.log(row)
                    if (row.recordset.length > 0) {
                        res.render('explore', { data: row.recordset, val: 0 })
                    }
                    else {
                        res.render('explore', { data: row.recordset, val: 1 })
                    }
                }
            })
        }
    })
})


Router.get('/consumer', (req, res) => {
    if (req.session.username && req.session.role == 'C') {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                var request = new sql.Request();
                var query = `select user_id from User1 where username='${req.session.username}'`
                request.query(query, (err, record) => {
                    if (err) console.log(err)
                    const datas = record.recordset[0]['user_id']
                    console.log(datas)
                    if (datas) {
                        console.log(datas)
                        var request = new sql.Request()
                        var query = `select * from Consumer where consumer_id=${datas}`
                        request.query(query, (err, row) => {
                            if (err) throw err
                            else {
                                const datas = row.recordset[0]
                                var request = new sql.Request()
                                var query = `select * from Manufacturer`
                                request.query(query, (err, rows) => {
                                    if (err) throw err
                                    else {
                                        const newdata = rows.recordset
                                        res.render('ProfileCon1', { data: datas, manfact: newdata })
                                        console.log(datas)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })

    }
    else {
        res.redirect('/home')
    }
})

Router.get('/manufuacturerp', (req, res) => {
    if (req.session.username && req.session.role == 'M') {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                var request = new sql.Request();
                var query = `select user_id from User1 where username='${req.session.username}'`
                request.query(query, (err, record) => {
                    if (err) console.log(err)
                    const datas = record.recordset[0]['user_id']
                    console.log(datas)
                    if (datas) {
                        console.log(datas)
                        var request = new sql.Request()
                        var query = `select * from Manufacturer where manufacturer_id=${datas}`
                        request.query(query, (err, row) => {
                            if (err) throw err
                            else {
                                const datas = row.recordset[0]
                                const datass = row.recordset[0]['manufacturer_id']
                                var request = new sql.Request()
                                var query = `select * from OnsiteMeetingLocation where manufacturer_id=${datass}`
                                request.query(query, (err, rowz) => {
                                    if (err) throw err
                                    else {
                                        res.render('ProfileManu1', { data: datas, check: 0, review: 2, premium: 0, meet: rowz.recordset })
                                    }
                                })
                                console.log(datas)
                            }
                        })
                    }
                    else {
                        console.log("No Reccord Found")
                    }
                })
            }
        })
    }
    else {
        res.redirect('/home')
    }
})

Router.get('/manufacturer/:id', (req, res) => {
    const id = req.params['id']
    console.log(id)
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection is Successfull")
            var request = new sql.Request()
            var query = `select * from Manufacturer where manufacturer_id=${id}`
            request.query(query, (err, row) => {
                if (err) throw err
                else {
                    var request = new sql.Request();
                    var query = `select user_id from User1 where username='${req.session.username}'`
                    request.query(query, (err, record) => {
                        if (err) console.log(err)
                        if (record.recordset <= 0) {
                            res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 2, premium: 0, meet: 0 })
                        } else {
                            const datas = record.recordset[0]['user_id']
                            console.log(datas)
                            if (datas == row.recordset[0]['manufacturer_id']) {
                                var request = new sql.Request()
                                var query = `select * from OnsiteMeetingLocation where manufacturer_id=${row.recordset[0]['manufacturer_id']}`
                                request.query(query, (err, rowz) => {
                                    if (err) throw err
                                    else {
                                        res.render('ProfileManu1', { data: row.recordset[0], check: 0, review: 2, premium: 0, meet: rowz.recordset })
                                    }
                                })
                            } else {
                                if (req.session.username && req.session.role != 'M') {
                                    var query = `select * from Review where consumer_id='${datas}' and manufacturer_id='${id}'`
                                    var request = new sql.Request()
                                    request.query(query, (err, records) => {
                                        if (err) console.log(err)
                                        else {
                                            var request = new sql.Request()
                                            var query = `select * from Consumer where consumer_id=${datas}`;
                                            request.query(query, (err, result) => {
                                                if (err) throw err
                                                else {
                                                    if (result.recordset[0]['is_premium'] == 1) {
                                                        if (records.recordset.length <= 0) {
                                                            res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 1, premium: 1, meet: 0 })
                                                        }
                                                        else {
                                                            res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 0, premium: 1, meet: 0 })
                                                        }
                                                    }
                                                    else {
                                                        if (records.recordset.length <= 0) {
                                                            res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 1, premium: 0, meet: 0 })
                                                        }
                                                        else {
                                                            res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 0, premium: 0, meet: 0 })
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                                else {
                                    res.render('ProfileManu1', { data: row.recordset[0], check: 1, review: 2, premium: 0, meet: 0 })
                                }
                            }
                        }
                    })
                }
            })
        }
    })
})

Router.post('/review', (req, res) => {
    var value
    var basic
    var standard
    var premium
    if (req.session.username && req.session.role != 'M' && req.session.role != 'A') {
        const role = req.body.role
        if (role == "Positive") {
            value = 1
        } else {
            value = 0
        }
        const manid = req.body.manid
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                console.log("Connection is Successfull")
                var request = new sql.Request();
                var query = `select user_id from User1 where username='${req.session.username}'`
                request.query(query, (err, record) => {
                    if (err) throw err
                    else {
                        const datas = record.recordset[0]['user_id']
                        var request = new sql.Request()
                        var query = `select * from Manufacturer where manufacturer_id=${manid}`
                        request.query(query, (err, row) => {
                            if (err) throw err
                            else {
                                var rating = row.recordset[0]['rating']
                                rating = rating + value
                                if (rating == 2 && rating < 3) {
                                    basic = 1
                                } else if (rating >= 3 && rating < 4) {
                                    standard = 1
                                } else if (rating >= 4) {
                                    premium = 1
                                }
                                var request = new sql.Request()
                                var query = "SELECT TOP 1 * FROM Review ORDER BY review_id DESC"
                                request.query(query, (err, roa) => {
                                    if (err) throw err
                                    else {
                                        var newid
                                        if (roa.recordset <= 0) {
                                            newid = 1
                                        }
                                        else {
                                            newid = (roa.recordset[0]['review_id']) + 1
                                        }

                                        console.log(newid)
                                        var request = new sql.Request()
                                        var query = `INSERT into Review (review_id,consumer_id,manufacturer_id,rating) VALUES (${newid},${datas},${manid},${1})`
                                        request.query(query, (err, result) => {
                                            if (err) throw err
                                            else {
                                                if (basic == 1) {
                                                    var request = new sql.Request()
                                                    var query = `UPDATE Manufacturer SET rating=${rating}, is_premium=${1} WHERE manufacturer_id=${manid}`
                                                    request.query(query, (err, row) => {
                                                        if (err) throw err
                                                        else {
                                                            var request = new sql.Request()
                                                            var query = " SELECT TOP 1 * FROM PremiumManufacturer ORDER BY premium_manufacturer_id DESC"
                                                            request.query(query, (err, row) => {
                                                                if (err) throw err
                                                                else {
                                                                    var data;
                                                                    if (row.recordset <= 0) {
                                                                        data = 1
                                                                    }
                                                                    else {
                                                                        data = row.recordset[0]['premium_manufacturer_id'] + 1
                                                                    }

                                                                    var request = new sql.Request()
                                                                    var query = `INSERT INTO PremiumManufacturer(premium_manufacturer_id, manufacturer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${manid}, 'basic', '2022-01-01', '2022-12-31')`;
                                                                    request.query(query, (err, resu) => {
                                                                        if (err) throw err
                                                                        else {
                                                                            res.redirect(`/manufacturer/${manid}`)
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                } else if (standard == 1) {
                                                    var request = new sql.Request()
                                                    var query = `UPDATE Manufacturer SET rating=${rating}, is_premium=${1} WHERE manufacturer_id=${manid}`
                                                    request.query(query, (err, row) => {
                                                        if (err) throw err
                                                        else {
                                                            var request = new sql.Request()
                                                            var query = " SELECT TOP 1 * FROM PremiumManufacturer ORDER BY premium_manufacturer_id DESC"
                                                            request.query(query, (err, row) => {
                                                                if (err) throw err
                                                                else {
                                                                    var data
                                                                    if (row.recordset <= 0) {
                                                                        data = 1
                                                                    }
                                                                    else {
                                                                        data = row.recordset[0]['premium_manufacturer_id'] + 1
                                                                    }

                                                                    var request = new sql.Request()
                                                                    var query = `INSERT INTO PremiumManufacturer(premium_manufacturer_id, manufacturer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${manid}, 'standard', '2022-01-01', '2022-12-31')`;
                                                                    request.query(query, (err, resu) => {
                                                                        if (err) throw err
                                                                        else {
                                                                            res.redirect(`/manufacturer/${manid}`)
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                                else if (premium == 1) {
                                                    var request = new sql.Request()
                                                    var query = `UPDATE Manufacturer SET rating=${rating}, is_premium=${1} WHERE manufacturer_id=${manid}`
                                                    request.query(query, (err, row) => {
                                                        if (err) throw err
                                                        else {
                                                            var request = new sql.Request()
                                                            var query = " SELECT TOP 1 * FROM PremiumManufacturer ORDER BY premium_manufacturer_id DESC"
                                                            request.query(query, (err, row) => {
                                                                if (err) throw err
                                                                else {
                                                                    var data
                                                                    if (row.recordset <= 0) {
                                                                        data = 1
                                                                    }
                                                                    else {
                                                                        data = row.recordset[0]['premium_manufacturer_id'] + 1
                                                                    }

                                                                    var request = new sql.Request()
                                                                    var query = `INSERT INTO PremiumManufacturer(premium_manufacturer_id, manufacturer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${manid}, 'premium', '2022-01-01', '2022-12-31')`;
                                                                    request.query(query, (err, resu) => {
                                                                        if (err) throw err
                                                                        else {
                                                                            res.redirect(`/manufacturer/${manid}`)
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                                else {
                                                    var request = new sql.Request()
                                                    var query = `UPDATE Manufacturer SET rating=${rating} WHERE manufacturer_id=${manid}`
                                                    request.query(query, (err, row) => {
                                                        if (err) throw err
                                                        else {
                                                            res.redirect(`/manufacturer/${manid}`)
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    else {
        res.redirect('/home')
    }
})

Router.post('/setpremconsum', (req, res) => {
    if (req.session.username) {
        sql.connect(config, (err) => {
            if (err) throw err
            else {
                const role = req.body.role
                const conid = req.body.conid
                if (role == "Basic") {
                    var request = new sql.Request()
                    var query = `UPDATE Consumer SET is_premium=${1} WHERE consumer_id=${conid}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            var request = new sql.Request()
                            var query = `Select * from PremiumConsumer where consumer_id=${conid}`
                            request.query(query, (err, row1) => {
                                if (err) throw err
                                else {
                                    if (row1.recordset.length <= 0) {
                                        var request = new sql.Request()
                                        var query = " SELECT TOP 1 * FROM PremiumConsumer ORDER BY premium_consumer_id DESC"
                                        request.query(query, (err, row) => {
                                            if (err) throw err
                                            else {
                                                var data
                                                if (row.recordset <= 0) {
                                                    data = 1
                                                }
                                                else {
                                                    data = row.recordset[0]['premium_consumer_id'] + 1
                                                }
                                                var request = new sql.Request()
                                                var query = `INSERT INTO PremiumConsumer(premium_consumer_id, consumer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${conid}, 'basic', '2022-01-01', '2022-12-31')`;
                                                request.query(query, (err, resu) => {
                                                    if (err) throw err
                                                    else {
                                                        res.redirect(`/editprofile`)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else {
                                        const val = row1.recordset[0]['premium_consumer_id']
                                        var request = new sql.Request()
                                        var query = `Update PremiumConsumer set subscription_type = 'basic', subscription_start_date = '2022-01-01', subscription_end_date = '2022-12-31' where consumer_id = ${conid} `
                                        request.query(query, (err, resu) => {
                                            if (err) throw err
                                            else {
                                                res.redirect(`/editprofile`)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
                if (role == "Standard") {
                    var request = new sql.Request()
                    var query = `UPDATE Consumer SET is_premium=${1} WHERE consumer_id=${conid}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            var request = new sql.Request()
                            var query = `Select * from PremiumConsumer where consumer_id=${conid}`
                            request.query(query, (err, row1) => {
                                if (err) throw err
                                else {
                                    if (row1.recordset.length <= 0) {
                                        var request = new sql.Request()
                                        var query = " SELECT TOP 1 * FROM PremiumConsumer ORDER BY premium_consumer_id DESC"
                                        request.query(query, (err, row) => {
                                            if (err) throw err
                                            else {
                                                var data
                                                if (row.recordset <= 0) {
                                                    data = 1
                                                }
                                                else {
                                                    data = row.recordset[0]['premium_consumer_id'] + 1
                                                }

                                                var request = new sql.Request()
                                                var query = `INSERT INTO PremiumConsumer(premium_consumer_id, consumer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${conid}, 'standard', '2022-01-01', '2022-12-31')`;
                                                request.query(query, (err, resu) => {
                                                    if (err) throw err
                                                    else {
                                                        res.redirect(`/editprofile`)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else {
                                        const val = row1.recordset[0]['premium_consumer_id']
                                        var request = new sql.Request()
                                        var query = `Update PremiumConsumer set subscription_type = 'standard', subscription_start_date = '2022-01-01', subscription_end_date = '2022-12-31' where consumer_id = ${conid}`
                                        request.query(query, (err, resu) => {
                                            if (err) throw err
                                            else {
                                                res.redirect(`/editprofile`)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
                if (role == "Premium") {
                    var request = new sql.Request()
                    var query = `UPDATE Consumer SET is_premium=${1} WHERE consumer_id=${conid}`
                    request.query(query, (err, row) => {
                        if (err) throw err
                        else {
                            var request = new sql.Request()
                            var query = `Select * from PremiumConsumer where consumer_id=${conid}`
                            request.query(query, (err, row1) => {
                                if (err) throw err
                                else {
                                    if (row1.recordset.length <= 0) {
                                        var request = new sql.Request()
                                        var query = " SELECT TOP 1 * FROM PremiumConsumer ORDER BY premium_consumer_id DESC"
                                        request.query(query, (err, row) => {
                                            if (err) throw err
                                            else {
                                                var data
                                                if (row.recordset <= 0) {
                                                    data = 1
                                                } else {
                                                    data = row.recordset[0]['premium_consumer_id'] + 1
                                                }
                                                var request = new sql.Request()
                                                var query = `INSERT INTO PremiumConsumer(premium_consumer_id, consumer_id, subscription_type, subscription_start_date, subscription_end_date)  VALUES(${data}, ${conid}, 'premium', '2022-01-01', '2022-12-31')`;
                                                request.query(query, (err, resu) => {
                                                    if (err) throw err
                                                    else {
                                                        res.redirect(`/editprofile`)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else {
                                        const val = row1.recordset[0]['premium_consumer_id']
                                        var request = new sql.Request()
                                        var query = `Update PremiumConsumer set subscription_type='premium', subscription_start_date='2022-01-01', subscription_end_date='2022-12-31' where consumer_id=${conid}`;
                                        request.query(query, (err, resu) => {
                                            if (err) throw err
                                            else {
                                                res.redirect(`/editprofile`)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }
})

Router.post('/cevent', (req, res) => {
    const company = req.body.company
    const benefit = req.body.benefit
    const id = req.body.id
    console.log(company, benefit, id)
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("connection is successfull")
            var request = new sql.Request()
            var query = `insert into partnerships (manufacturer_id,partner_company_name,partner_benefits) values (${id},'${company}','${benefit}')`;
            request.query(query, (err) => {
                if (err) throw err
                else {
                    console.log("Record Added Successfully");
                    res.redirect('/event')
                }
            })
        }
    })
})

Router.get('/event', (req, res) => {
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection is Successfull")
            var request = new sql.Request()
            var query = `select * from partnerships`
            request.query(query, (err, row) => {
                if (err) throw err
                else {
                    const data = row.recordset
                    res.render('events', { data: data })
                }
            })
        }
    })
})

Router.post('/meeting', (req, res) => {
    const select = req.body.select
    const address = req.body.address
    console.log(address, select)

    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection Added Successfully")
            var request = new sql.Request()

            var query = `insert into OnsiteMeetingLocation (manufacturer_id,address) values (${select},'${address}')`
            request.query(query, (err, row) => {
                if (err) throw err
                else {
                    res.redirect('/consumer')
                }
            })
        }
    })
})

Router.get('/del/:id/:ids', (req, res) => {
    const id = req.params.id
    const ids = req.params.ids
    sql.connect(config, (err) => {
        if (err) throw err
        else {
            console.log("Connection is Successfull")
            var request = new sql.Request()
            var query = `delete from OnsiteMeetingLocation where location_id=${id}`
            request.query(query, (err) => {
                if (err) throw err
                else {
                    res.redirect(`/manufacturer/${ids}`)
                }
            })
        }
    })
})

app.use('/', Router)
app.listen(5000, () => {
    console.log('Server is listening on port', 5000);
})
