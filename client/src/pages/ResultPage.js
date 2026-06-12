import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useResult } from '../hooks/useResult';
import { PaywallModal } from './PaywallModal';
export function ResultPage({ userId }) {
    const { result, loading, doPay } = useResult(userId);
    if (loading)
        return _jsx("div", { className: "result-loading", children: "\u8BA1\u7B97\u7ED3\u679C\u4E2D..." });
    if (!result)
        return _jsx("div", { children: "\u6682\u65E0\u7ED3\u679C" });
    return (_jsxs("div", { className: "result-page", children: [_jsx("h2", { children: "\u4F60\u7684\u5065\u5EB7\u8BC4\u4F30\u7ED3\u679C" }), _jsxs("div", { className: "result-card", children: [_jsxs("div", { className: "result-item", children: [_jsx("span", { children: "BMI" }), _jsx("strong", { children: result.bmi })] }), _jsxs("div", { className: "result-item", children: [_jsx("span", { children: "\u5206\u7C7B" }), _jsx("strong", { children: result.bmiCategory === 'normal' ? '正常' : result.bmiCategory === 'overweight' ? '超重' : result.bmiCategory === 'obese' ? '肥胖' : '偏瘦' })] }), _jsxs("div", { className: "result-item", children: [_jsx("span", { children: "\u5EFA\u8BAE\u65E5\u6444\u5165\u91CF" }), _jsxs("strong", { children: [result.dailyCalories, " kcal"] })] })] }), !result.isPaid && (_jsx(PaywallModal, { onPay: doPay })), result.isPaid && (_jsxs("div", { className: "result-full", children: [_jsx("h3", { children: "\u5B8C\u6574\u62A5\u544A" }), _jsxs("p", { children: ["\u9884\u8BA1 ", result.targetDate, " \u8FBE\u5230\u76EE\u6807\u4F53\u91CD"] }), _jsx("div", { className: "prediction-chart", children: result.resultJson.weeklyPrediction.map((w) => (_jsxs("div", { className: "chart-row", children: ["\u7B2C", w.week, "\u5468: ", w.weight, " kg (", w.date, ")"] }, w.week))) })] }))] }));
}
