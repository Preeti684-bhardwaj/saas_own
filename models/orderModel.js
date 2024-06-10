module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('order', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        StripeCustomerId:Sequelize.STRING,
        date: Sequelize.DATE,
        invoiceNumber: Sequelize.STRING,
        subscription: Sequelize.JSON,
        payment: Sequelize.JSON,
        status: Sequelize.STRING, // Add status field
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    });
    return Order;
};
