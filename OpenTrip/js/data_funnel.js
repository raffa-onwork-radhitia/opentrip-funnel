window.openTripFunnelData = {
  metadata: {
    project_name: "OpenTrip Funnel Analytics",
    period: "2026",
    generated_by: "Trip Organizer Dashboard",
  },
  summary: {
    total_pengunjung: 1200,
    total_isi_form: 450,
    total_chat_admin: 210,
    total_dp: 95,
    total_lunas: 42,
  },
  metric_cards: [
    {
      title: "Total Pengunjung Web",
      value: 1200,
    },
    {
      title: "Peserta Lunas",
      value: 42,
    },
    {
      title: "Conversion Rate",
      value: 3.5,
    },
  ],
  funnel_stages: ["Pengunjung", "Isi Form", "Chat Admin", "Bayar DP", "Lunas"],
  funnel_data: [1200, 450, 210, 95, 42],
  sources: [
    {
      name: "TikTok Reels",
      pengunjung: 500,
      isi_form: 200,
      chat_admin: 100,
      dp: 45,
      lunas: 20,
      conversion_rate: 4.0,
      status: "Top",
    },
    {
      name: "Instagram Ads",
      pengunjung: 400,
      isi_form: 150,
      chat_admin: 70,
      dp: 30,
      lunas: 14,
      conversion_rate: 3.5,
      status: "Stable",
    },
    {
      name: "WhatsApp Organic",
      pengunjung: 300,
      isi_form: 100,
      chat_admin: 40,
      dp: 20,
      lunas: 8,
      conversion_rate: 2.6,
      status: "Alert",
    },
  ],
};
