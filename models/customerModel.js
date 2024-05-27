module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('customer', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phone: Sequelize.STRING,
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        IsActivated: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        IsEmailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        IsPhoneVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        emailToken: Sequelize.STRING,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    });
    return Customer;
};

