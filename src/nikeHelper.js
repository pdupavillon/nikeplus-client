export class NikeHelper{
    static GetSummary(data, name){
        let result = data.summaries.filter((s) => s.metric === name)
        return (result && result.length === 1 && result[0]) ? result[0] : null
    }
    static GetMetric(data, name){
        let result = data.metrics.filter((val) => val.type === name)
        return (result && result.length === 1 && result[0].values && result[0].values.length > 0) ? result[0].values : null
    }
}