const COLUMNS = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = [
  ['', '姓名', '部门', 'Q1 销售额', 'Q2 销售额', 'Q3 销售额', 'Q4 销售额', '全年合计'],
  ['1', '张三', '市场部', '¥128,500', '¥135,200', '¥142,800', '¥156,300', '¥562,800'],
  ['2', '李四', '技术部', '¥98,300', '¥102,100', '¥96,700', '¥108,500', '¥405,600'],
  ['3', '王五', '销售部', '¥215,600', '¥198,400', '¥223,100', '¥235,800', '¥872,900'],
  ['4', '赵六', '运营部', '¥76,200', '¥82,900', '¥88,500', '¥91,300', '¥338,900'],
  ['5', '钱七', '市场部', '¥145,800', '¥152,300', '¥161,200', '¥168,700', '¥628,000'],
  ['6', '孙八', '技术部', '¥112,400', '¥108,600', '¥118,900', '¥125,200', '¥465,100'],
  ['7', '周九', '销售部', '¥189,300', '¥195,800', '¥201,500', '¥215,600', '¥802,200'],
  ['8', '吴十', '运营部', '¥85,600', '¥91,200', '¥88,400', '¥96,800', '¥362,000'],
  ['9', '', '', '', '', '', '', ''],
  ['10', '', '', '', '', '', '', ''],
];

export function ExcelTheme() {
  return (
    <div className="theme-excel">
      <div className="xl-titlebar">
        <div className="xl-titlebar-left">
          <span className="xl-app-icon">✕</span>
          <span className="xl-title-menu">自动保存</span>
          <span className="xl-title-name">2024年度销售数据.xlsx</span>
        </div>
        <div className="xl-titlebar-right">
          <span>—</span><span>□</span><span>×</span>
        </div>
      </div>

      <div className="xl-ribbon-tabs">
        <span className="xl-rtab active">开始</span>
        <span className="xl-rtab">插入</span>
        <span className="xl-rtab">页面布局</span>
        <span className="xl-rtab">公式</span>
        <span className="xl-rtab">数据</span>
        <span className="xl-rtab">审阅</span>
        <span className="xl-rtab">视图</span>
      </div>

      <div className="xl-ribbon">
        <div className="xl-ribbon-group">
          <div className="xl-ribbon-buttons">
            <span className="xl-rbtn">📋</span>
            <span className="xl-rbtn">✂️</span>
            <span className="xl-rbtn">📄</span>
            <span className="xl-rbtn" style={{ fontWeight: 'bold', fontSize: 14 }}>B</span>
            <span className="xl-rbtn" style={{ fontStyle: 'italic', fontSize: 14 }}>I</span>
            <span className="xl-rbtn" style={{ textDecoration: 'underline', fontSize: 14 }}>U</span>
          </div>
          <div className="xl-ribbon-label">剪贴板 / 字体</div>
        </div>
        <div className="xl-ribbon-group">
          <div className="xl-ribbon-buttons">
            <span className="xl-rbtn">左</span>
            <span className="xl-rbtn">中</span>
            <span className="xl-rbtn">右</span>
            <span className="xl-rbtn">📊</span>
            <span className="xl-rbtn">📉</span>
          </div>
          <div className="xl-ribbon-label">对齐 / 图表</div>
        </div>
      </div>

      <div className="xl-formula-bar">
        <span className="xl-fx">fx</span>
        <span className="xl-formula-input">=SUM(D2:G2)</span>
      </div>

      <div className="xl-grid-container">
        <table className="xl-grid">
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th key={i} className={i === 0 ? 'xl-corner' : 'xl-col-header'}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`${ci === 0 ? 'xl-row-header' : ''} ${ri === 0 ? 'xl-header-row' : ''} ${ri === 1 && ci === 3 ? 'xl-active' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="xl-sheet-tabs">
        <span className="xl-sheet-tab active">Sheet1</span>
        <span className="xl-sheet-tab">Sheet2</span>
        <span className="xl-sheet-tab">Sheet3</span>
        <span className="xl-sheet-add">+</span>
      </div>

      <div className="xl-statusbar">
        <span>就绪</span>
        <span>平均值: ¥486,937</span>
        <span>计数: 8</span>
        <span>求和: ¥3,895,500</span>
        <span>缩放: 100%</span>
      </div>
    </div>
  );
}
