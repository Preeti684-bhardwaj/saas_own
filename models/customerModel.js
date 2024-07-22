// const { freeTrial } = require("../controllers/customerController");

module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('customer', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        name:Sequelize.STRING,
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phone: Sequelize.STRING,
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        trialStartDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        trialEndDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        isTrialActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        freeTrialFeature: {
            type: Sequelize.JSON,
            // defaultValue: {
            //     numberOfCampaigns: 2,
            //     // videoLength: 30,
            //     // campaignStorage: 26,214,400 
            // }
        },
        isSubscribed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        resetToken:Sequelize.STRING,
        resetTokenExpire:Sequelize.DATE,
        otp:Sequelize.STRING,
        otpExpire:Sequelize.DATE,
        IsActivated: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isEmailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        IsPhoneVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        emailToken: Sequelize.STRING,
        api_key:Sequelize.STRING,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    });
    return Customer;
};

