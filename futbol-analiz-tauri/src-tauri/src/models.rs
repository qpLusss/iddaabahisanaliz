use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AiRequest {
    pub enabled: bool,
    pub provider: Option<String>,
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
}

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DataSourceRequest {
    pub football_data_token: Option<String>,
    pub api_football_key: Option<String>,
    pub api_football_base_url: Option<String>,
}

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisOptionsRequest {
    pub sharp_mode: Option<bool>,
    pub auto_track_scan: Option<bool>,
    pub light_scan: Option<bool>,
}

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyScanRequest {
    pub selected_date: Option<String>,
    pub league_filters: Option<Vec<String>>,
    pub league_whitelist: Option<Vec<String>>,
    pub league_blacklist: Option<Vec<String>>,
    pub min_confidence: Option<u8>,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketCalibrationRequest {
    pub market_group: String,
    pub sample_size: u16,
    pub hit_rate: u8,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LeagueCalibrationRequest {
    pub league: String,
    pub sample_size: u16,
    pub top_hit_rate: u8,
    pub market_profiles: Option<Vec<MarketCalibrationRequest>>,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalibrationProfileRequest {
    pub sample_size: Option<u16>,
    pub overall_top_hit_rate: Option<u8>,
    pub market_profiles: Option<Vec<MarketCalibrationRequest>>,
    pub league_profiles: Option<Vec<LeagueCalibrationRequest>>,
}

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackedMatchRequest {
    pub id: String,
    pub home_team: String,
    pub away_team: String,
    pub match_date: String,
    pub match_time: Option<String>,
    pub league: Option<String>,
    #[allow(dead_code)]
    pub url: Option<String>,
    pub mackolik_match_page_id: Option<u64>,
    pub matchcast_id: Option<u64>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackedTimelineEvent {
    pub minute: String,
    pub minute_value: u16,
    pub event_type: String,
    pub side: String,
    pub label: String,
    pub note: String,
    pub score: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackedMatchStatus {
    pub id: String,
    pub found: bool,
    pub source: String,
    pub state: String,
    pub status_label: String,
    pub home_goals: Option<u8>,
    pub away_goals: Option<u8>,
    pub halftime_score: Option<String>,
    pub home_team_id: Option<u64>,
    pub away_team_id: Option<u64>,
    pub home_logo_url: Option<String>,
    pub away_logo_url: Option<String>,
    pub mackolik_match_page_id: Option<u64>,
    pub matchcast_id: Option<u64>,
    pub timeline_events: Vec<TrackedTimelineEvent>,
    pub note: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchInfo {
    pub home_team: String,
    pub away_team: String,
    pub league: String,
    pub match_date: String,
    pub match_time: String,
    pub location_type: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Probabilities {
    pub home_win: u8,
    pub draw: u8,
    pub away_win: u8,
    pub btts_yes: u8,
    pub btts_no: u8,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketBlock {
    pub over25: u8,
    pub over25_note: String,
    pub over35: u8,
    pub over35_note: String,
    pub projected_goals: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceStatus {
    pub mode: String,
    pub label: String,
    pub detail: String,
    pub health: String,
    pub fallback_used: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfidenceFactor {
    pub label: String,
    pub score: u8,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LeagueProfile {
    pub title: String,
    pub style: String,
    pub summary: String,
    pub bias_market: String,
    pub caution: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketSpecialist {
    pub slot: String,
    pub market: String,
    pub probability: u8,
    pub summary: String,
    pub tone: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DetailModule {
    pub label: String,
    pub score: u8,
    pub summary: String,
    pub tone: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OddsMovement {
    pub label: String,
    pub score: u8,
    pub direction: String,
    pub detail: String,
    pub source: String,
    pub market_depth: u16,
    pub odds_channels: u16,
    pub live_odds: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardFilter {
    pub allow: bool,
    pub title: String,
    pub reason: String,
    pub severity: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketInsight {
    pub market: String,
    pub probability: u8,
    pub angle: String,
    pub detail: String,
    pub tone: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerdictStep {
    pub title: String,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Recommendation {
    pub market: String,
    pub probability: u8,
    pub reason: String,
    pub risk_label: String,
    pub risk_class: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecisionFactor {
    pub title: String,
    pub value: String,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisPillar {
    pub title: String,
    pub score: u8,
    pub summary: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScenarioCard {
    pub label: String,
    pub probability: u8,
    pub summary: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InsightNote {
    pub title: String,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExplainCard {
    pub title: String,
    pub impact: String,
    pub detail: String,
    pub tone: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetKpi {
    pub key: String,
    pub label: String,
    pub value: u8,
    pub target: String,
    pub status: String,
    pub sample_size: u16,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LineupVerification {
    pub primary_source: String,
    pub secondary_source: String,
    pub consistency: String,
    pub confidence: u8,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AiSummaryCard {
    pub title: String,
    pub detail: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentMatchRow {
    pub team: String,
    pub form: String,
    pub goal_average: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct H2HMatchRow {
    pub date: String,
    pub score: String,
    pub outcome: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LeagueStandingRow {
    pub position: u8,
    pub team: String,
    pub played: u8,
    pub won: u8,
    pub draw: u8,
    pub lost: u8,
    pub goal_diff: i16,
    pub points: u16,
    pub form: String,
    pub highlight: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KnockoutTieContext {
    pub title: String,
    pub first_leg_score: String,
    pub aggregate_state: String,
    pub tactical_note: String,
    pub pressure_note: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisResponse {
    pub demo_mode: bool,
    pub analysis_id: String,
    pub sharp_mode: bool,
    pub source_label: String,
    pub source_status: SourceStatus,
    pub confidence_score: u8,
    pub confidence_factors: Vec<ConfidenceFactor>,
    pub league_profile: LeagueProfile,
    pub detail_engine_summary: String,
    pub detail_modules: Vec<DetailModule>,
    pub odds_movement: Option<OddsMovement>,
    pub market_specialists: Vec<MarketSpecialist>,
    pub hard_filter: HardFilter,
    pub ai_layer_used: bool,
    pub ai_model_label: String,
    pub ai_status_message: String,
    pub ai_summary_cards: Vec<AiSummaryCard>,
    pub match_info: MatchInfo,
    pub probabilities: Probabilities,
    pub markets: MarketBlock,
    pub market_insights: Vec<MarketInsight>,
    pub recommendations: Vec<Recommendation>,
    pub ai_narrative: String,
    pub analyst_verdict: String,
    pub tactical_summary: String,
    pub risk_summary: String,
    pub verdict_steps: Vec<VerdictStep>,
    pub knockout_tie: Option<KnockoutTieContext>,
    pub form_summary: String,
    pub h2h_summary: String,
    pub standings_summary: String,
    pub recent_matches: Vec<RecentMatchRow>,
    pub h2h_matches: Vec<H2HMatchRow>,
    pub league_standings: Vec<LeagueStandingRow>,
    pub decision_factors: Vec<DecisionFactor>,
    pub analysis_pillars: Vec<AnalysisPillar>,
    pub scenario_cards: Vec<ScenarioCard>,
    pub insight_notes: Vec<InsightNote>,
    pub model_explain_cards: Vec<ExplainCard>,
    pub net_kpis: Vec<NetKpi>,
    pub lineup_verification: Option<LineupVerification>,
    pub disclaimer: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyScanPick {
    pub rank: u8,
    pub event_id: u64,
    pub detail_url: String,
    pub reliability_score: u8,
    pub result_code: String,
    pub result_label: String,
    pub result_probability: u8,
    pub safe_market: String,
    pub safe_market_probability: u8,
    pub analysis: AnalysisResponse,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CouponLeg {
    pub match_label: String,
    pub market: String,
    pub probability: u8,
    pub summary: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CouponPackage {
    pub title: String,
    pub strategy: String,
    pub combined_confidence: u8,
    pub risk_label: String,
    pub auto_track_hint: String,
    pub legs: Vec<CouponLeg>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyScanResponse {
    pub source_url: String,
    pub source_label: String,
    pub scan_date: String,
    pub sharp_mode: bool,
    pub auto_track_scan: bool,
    pub league_filters: Vec<String>,
    pub league_whitelist: Vec<String>,
    pub league_blacklist: Vec<String>,
    pub min_confidence: u8,
    pub candidate_count: usize,
    pub scanned_count: usize,
    pub analyzed_count: usize,
    pub matched_count: usize,
    pub qualified_count: usize,
    pub failed_count: usize,
    pub top_picks: Vec<DailyScanPick>,
    pub avoid_picks: Vec<DailyScanPick>,
    pub coupon_packages: Vec<CouponPackage>,
    pub summary_note: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveMatchPick {
    pub rank: u8,
    pub event_id: u64,
    pub detail_url: String,
    pub minute_label: String,
    pub live_score: String,
    pub halftime_score: Option<String>,
    pub first_half_over05_probability: u8,
    pub first_half_market_label: String,
    pub first_half_note: String,
    pub secondary_market_label: String,
    pub secondary_market_probability: u8,
    pub secondary_market_note: String,
    pub result_market_label: String,
    pub result_market_probability: u8,
    pub result_market_note: String,
    pub live_comment: String,
    pub tracked_status: TrackedMatchStatus,
    pub analysis: AnalysisResponse,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveScanResponse {
    pub source_url: String,
    pub source_label: String,
    pub live_count: usize,
    pub analyzed_count: usize,
    pub summary_note: String,
    pub picks: Vec<LiveMatchPick>,
}
