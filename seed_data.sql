-- ================================================
-- SEED DATA: Sample startups for the Discover page
-- Run this in Supabase SQL Editor AFTER migration
-- ================================================

-- Insert sample startups (founder_id is NULL since these are demo data)
INSERT INTO startups (name, logo_url, tagline, sector, stage, raise_amount, about, product, website, trending) VALUES
(
    'Nebula AI',
    NULL,
    'Generative AI for pharmaceutical drug discovery',
    'HealthTech',
    'Series A',
    '$5M',
    'Nebula AI is revolutionizing pharmaceutical drug discovery using cutting-edge generative AI models. Founded in 2024 by a team of MIT researchers and pharma veterans, the company has developed proprietary transformer architectures that can predict molecular binding affinity with 94% accuracy — a 3x improvement over traditional computational methods. The platform has already identified 12 novel drug candidates for rare diseases, with 3 entering pre-clinical trials. Nebula AI partners with top-10 pharmaceutical companies and has secured letters of intent worth $8M in annual recurring revenue.',
    'Nebula''s core product is MoleculeForge — an AI-powered drug discovery platform that combines deep learning with quantum chemistry simulations. Researchers upload target protein structures and the platform generates optimized molecular candidates in hours instead of months. The platform includes real-time ADMET prediction (Absorption, Distribution, Metabolism, Excretion, Toxicity), interactive 3D molecular visualization, and automated patent landscape analysis. MoleculeForge integrates with existing lab information management systems (LIMS) and supports GxP-compliant workflows for regulatory submissions.',
    'https://nebula-ai.com',
    true
),
(
    'GreenGrid',
    NULL,
    'Decentralized energy trading platform for solar households',
    'CleanTech',
    'Seed',
    '$1.2M',
    'GreenGrid enables homeowners with solar panels to sell excess energy directly to their neighbors through a blockchain-based peer-to-peer marketplace. The platform eliminates the middleman, allowing prosumers to earn 40% more per kWh compared to selling back to the grid. Currently operating in 3 pilot cities across California, GreenGrid has onboarded 2,500 households and facilitated over $500K in energy trades. The team includes former Tesla Energy engineers and blockchain architects from Consensys.',
    'The GreenGrid platform consists of a smart meter IoT device that connects to home solar systems and a mobile app for managing energy trades. The proprietary matching algorithm optimizes energy distribution based on real-time demand, weather forecasts, and grid capacity. Smart contracts on the Polygon network handle automated settlements with sub-cent transaction fees. The dashboard provides analytics on energy production, consumption patterns, carbon offset tracking, and projected earnings.',
    'https://greengrid.energy',
    true
),
(
    'SecureChain',
    NULL,
    'Enterprise blockchain security for supply chain logistics',
    'FinTech',
    'Series B',
    '$12M',
    'SecureChain provides enterprise-grade blockchain infrastructure specifically designed for global supply chain operations. The platform enables end-to-end traceability of goods from raw material sourcing to final delivery, reducing fraud by 78% and disputes by 60% across pilot deployments. SecureChain currently serves 45 enterprise clients across automotive, pharmaceutical, and food & beverage industries, processing over 2 million transactions daily. The company has been recognized by Gartner as a Cool Vendor in Supply Chain Technology.',
    'SecureChain''s product suite includes ChainVerify (real-time product authentication using NFC tags and blockchain verification), ChainTrace (end-to-end shipment tracking with IoT sensor integration), and ChainComply (automated regulatory compliance reporting for cross-border trade). The platform supports multi-chain deployment across Hyperledger Fabric, Ethereum, and private networks. An intuitive no-code dashboard allows supply chain managers to configure workflows, set alert thresholds, and generate audit reports without technical expertise.',
    'https://securechain.io',
    false
),
(
    'MindBridge',
    NULL,
    'AI-powered mental health companion for corporate wellness',
    'HealthTech',
    'Seed',
    '$2M',
    'MindBridge is building the next generation of corporate mental health support using conversational AI trained on evidence-based therapeutic frameworks (CBT, DBT, ACT). The platform provides 24/7 accessible mental health support to employees, reducing the stigma barrier that prevents 65% of workers from seeking traditional therapy. Early pilots with Fortune 500 companies show a 35% reduction in reported burnout and 22% improvement in employee retention. MindBridge is HIPAA-compliant and SOC 2 Type II certified.',
    'The MindBridge platform offers an AI companion accessible via Slack, Teams, or a standalone mobile app. Employees can engage in structured therapeutic conversations, mood tracking, guided meditations, and crisis intervention pathways. The HR admin dashboard provides anonymized workforce wellbeing analytics, trend detection, and ROI reporting. The AI adapts its therapeutic approach based on user interaction patterns and escalates to licensed human therapists when clinical thresholds are detected.',
    'https://mindbridge.health',
    true
),
(
    'AgroSense',
    NULL,
    'Precision agriculture using satellite imagery and edge AI',
    'AgriTech',
    'Series A',
    '$4.5M',
    'AgroSense combines satellite imagery, drone data, and edge AI to give farmers actionable insights that increase crop yields by 25% while reducing water usage by 30%. The platform currently monitors over 500,000 acres across India, Brazil, and the US Midwest. AgroSense has partnerships with John Deere for equipment integration and Bayer Crop Science for pest management recommendations. The founding team includes agricultural scientists from ICRISAT and computer vision researchers from IIT Hyderabad.',
    'AgroSense deploys lightweight ML models on solar-powered edge devices installed across farmland. These devices process multispectral drone imagery and soil sensor data locally, providing real-time alerts for pest detection, nutrient deficiency, and irrigation optimization — even in areas with poor internet connectivity. The farmer-facing mobile app supports 12 regional languages and provides weather-adjusted planting recommendations. The enterprise dashboard enables agribusiness companies to monitor portfolio farm performance and predict harvest yields with 92% accuracy.',
    'https://agrosense.ag',
    false
),
(
    'QuantumLeap Finance',
    NULL,
    'Quantum computing algorithms for portfolio optimization',
    'FinTech',
    'Pre-Seed',
    '$800K',
    'QuantumLeap Finance is developing quantum-classical hybrid algorithms that solve portfolio optimization problems 100x faster than traditional methods. By leveraging quantum annealing techniques, the platform can process complex multi-asset portfolios with thousands of constraints in seconds rather than hours. The founding team includes a former Goldman Sachs quant and a quantum computing PhD from Caltech. The company has secured partnerships with two mid-tier hedge funds for beta testing and has published 3 peer-reviewed papers on quantum financial optimization.',
    'The QuantumLeap platform provides an API-first solution that integrates with existing portfolio management systems. Fund managers define their optimization constraints (risk tolerance, sector exposure, ESG criteria) and the platform returns optimal allocations computed on quantum hardware via cloud partnerships with IBM Quantum and D-Wave. The interactive dashboard visualizes the efficient frontier, stress test scenarios, and factor exposure analysis. A backtesting engine validates strategy performance across 20 years of historical market data.',
    'https://quantumleap.finance',
    false
);
