interface Props { onPay: () => void; }

export function PaywallModal({ onPay }: Props) {
  return (
    <div className="paywall">
      <h3>🔒 解锁完整报告</h3>
      <p>订阅后查看目标体重预测曲线和详细健康分析</p>
      <button onClick={onPay} className="pay-button">立即订阅 · ¥9.9/月</button>
    </div>
  );
}
