// module.exports = (sequelize, Sequelize) => {
//     const Transaction = sequelize.define('transaction', {
//         id: {
//             type: Sequelize.UUID,
//             primaryKey: true,
//             defaultValue: Sequelize.UUIDV4
//         },
//         orderId: {
//             type: Sequelize.UUID,
//             allowNull: false,
//             references: {
//                 model: 'orders',
//                 key: 'id'
//             }
//         },
//         amount: {
//             type: Sequelize.FLOAT,
//             allowNull: false
//         },
//         currency: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         method: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         status: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         transactionId: {
//             type: Sequelize.STRING,
//             allowNull: false,
//             unique: true
//         },
//         paymentDetails: {
//             type: Sequelize.JSON,
//             allowNull: true
//         },
//         createdAt: {
//             type: Sequelize.DATE,
//             defaultValue: Sequelize.NOW
//         },
//         updatedAt: {
//             type: Sequelize.DATE,
//             defaultValue: Sequelize.NOW
//         }
//     });

//     return Transaction;
// };
