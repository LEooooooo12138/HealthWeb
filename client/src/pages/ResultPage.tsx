import { useResult } from '../hooks/useResult';
import { PaywallModal } from './PaywallModal';

interface Props { userId: string; }

export function ResultPage({ userId }: Props) {
  const { result, loading, doPay } = useResult(userId);

  if (loading) return <div className="result-loading">计算结果中...</div>;
  if (!result) return <div>暂无结果</div>;

  return (
    <div className="result-page">
      <h2>你的健康评估结果</h2>
      <div className="result-card">
        <div className="result-item"><span>BMI</span><strong>{result.bmi}</strong></div>
        <div className="result-item"><span>分类</span><strong>{result.bmiCategory === 'normal' ? '正常' : result.bmiCategory === 'overweight' ? '超重' : result.bmiCategory === 'obese' ? '肥胖' : '偏瘦'}</strong></div>
        <div className="result-item"><span>建议日摄入量</span><strong>{result.dailyCalories} kcal</strong></div>
      </div>

      {!result.isPaid && (
        <PaywallModal onPay={doPay} />
      )}

      {result.isPaid && (
        <div className="result-full">
          <h3>完整报告</h3>
          <p>预计 {result.targetDate} 达到目标体重</p>
          <div className="prediction-chart">
            {result.resultJson.weeklyPrediction.map((w: any) => (
              <div key={w.week} className="chart-row">
                第{w.week}周: {w.weight} kg ({w.date})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
