module.exports = (sequelize, Sequelize) => {
    const SubscriptionPlan = sequelize.define('subscription_plan', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        frequency: Sequelize.ENUM('monthly', 'quarterly', 'half-yearly', 'annually'),
        price: Sequelize.DOUBLE,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    });
    return SubscriptionPlan;
};

