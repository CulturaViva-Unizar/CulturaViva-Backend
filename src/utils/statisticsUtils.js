

function filterDate(range){

    const today = new Date();

    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    let startDate = new Date();
    let showDays = false;

    switch (range) {
      case '1w':
        startDate.setDate(today.getDate() - 7);
        showDays = true;
         break;
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        showDays = true;
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '9m':
        startDate.setMonth(today.getMonth() - 9);
        break;
      case '12m':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(today.getFullYear() - 1);
    }

    const from = startDate.toISOString().split('T')[0];

    const matchCondition = { 
        $match: {
            date: { $gte: from }
        }
    }

    const groupCondition = {
        $group: {
                _id: {
                  year: { $substr: ['$date', 0, 4] },
                  month: { $substr: ['$date', 5, 2] },
                  day: { $substr: ['$date', 8, 2] }
                },
                total: { $sum: '$count' }
        }
    }

    const sortCondition = {
        $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1
        }
    }

    const projectCondition = {
        $project: {
            _id: 0,
            id: {
                $concat: ["$_id.year", "-", "$_id.month"]
            },
            total: 1,
            name: {
                $arrayElemAt: [months, { $subtract: [{ $toInt: "$_id.month" }, 1] }]
            }
        }
    }

    if (showDays){
        projectCondition.$project.id.$concat = ["$_id.year", "-", "$_id.month", "-", "$_id.day"]
        projectCondition.$project.name.$arrayElemAt = [days, { $mod: [{ $subtract: [{ $toInt: "$_id.day" }, 1] }, 7] }]
        projectCondition.$project.number = { $toInt: "$_id.day" }
    }

    const pipeline = [matchCondition, groupCondition, sortCondition, projectCondition];
    return pipeline
}

module.exports = { filterDate }