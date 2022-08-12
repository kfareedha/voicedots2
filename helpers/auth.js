const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const UserModel = require('../models/userModel');
const accountSid = "ACe2f312969f2156bd96aecd5a8ef26c66"
const authToken = "920044b4522d859ed1c74012f7bdbcdb"
const client = require('twilio')(accountSid, authToken);

module.exports={
    userCheck:(email)=>{
        console.log(email);
        return new Promise(async(resolve,reject)=>{
            let user = await UserModel.findOne({email})
            let status = {
                check:false
            }
            if(user){
                status.check=true
                status.user=user
                resolve(status)
            }else{
                resolve(status)
            }
        })

    },
    checkMobile:(mobile)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await UserModel.findOne({mobile})
            console.log(user)
            let status = {
                check:false
            }
            if(user){
                status.check=true
                status.user=user
                resolve(status)
            }else{
                resolve(status)
            }
        })
    },  
sendOtp: (mobile) => {
                    console.log(mobile)
                    return new Promise((resolve, reject) => {
                        client.verify.v2.services('VAa2efc61392d4a76c7114b9205f5a125c')
                            .verifications
                            .create({ to: '+91' + mobile, channel: 'sms' })
                            .then(verification => {
                                console.log(mobile);
                                console.log(verification.status)
                                resolve(verification)
                            });
                    })
            
                },
                verifyOtp: (otp, mobile) => {
                    return new Promise((resolve, reject) => {
                        client.verify.v2.services('VAa2efc61392d4a76c7114b9205f5a125c')
                            .verificationChecks
                            .create({ to: '+91' + mobile, code: otp })
                            .then((verification_check) => {
                                console.log(verification_check.status)
                                resolve(verification_check.status)
                            });
                    })
                }
            }