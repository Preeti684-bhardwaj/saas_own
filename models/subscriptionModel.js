module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define('subscription', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        frequency: Sequelize.ENUM('monthly', 'quarterly', 'half-yearly', 'annually'),
        plan:Sequelize.STRING,
        price: Sequelize.DOUBLE,
        startDate: Sequelize.DATEONLY,
        endDate: Sequelize.DATEONLY,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    });
    return Subscription;
};

