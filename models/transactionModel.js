module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define('transaction', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false
        },
        method: {
            type:  Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // customerId: {
        //     type: Sequelize.STRING,
        //     allowNull: false,
        //     unique: true
        // },
        paymentDetails: {
            type: Sequelize.JSON,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    return Transaction;
};
