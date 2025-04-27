export function TopPagesTable() {
    const pages = [
      {
        path: "larkon/ecommerce.html",
        views: 465,
        exitRate: "4.4%",
        exitRateStatus: "good",
      },
      {
        path: "larkon/dashboard.html",
        views: 426,
        exitRate: "20.4%",
        exitRateStatus: "bad",
      },
      {
        path: "larkon/chat.html",
        views: 254,
        exitRate: "12.5%",
        exitRateStatus: "warning",
      },
      {
        path: "larkon/auth-login.html",
        views: 3369,
        exitRate: "5.2%",
        exitRateStatus: "good",
      },
      {
        path: "larkon/email.html",
        views: 985,
        exitRate: "84.2%",
        exitRateStatus: "bad",
      },
      {
        path: "larkon/social.html",
        views: 653,
        exitRate: "2.4%",
        exitRateStatus: "good",
      },
      {
        path: "larkon/blog.html",
        views: 478,
        exitRate: "1.4%",
        exitRateStatus: "good",
      },
    ]
  
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-sm font-medium text-gray-500">Page Path</th>
              <th className="pb-2 text-right text-sm font-medium text-gray-500">Page Views</th>
              <th className="pb-2 text-right text-sm font-medium text-gray-500">Exit Rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0">
                <td className="py-3 text-sm">{page.path}</td>
                <td className="py-3 text-sm text-right">{page.views}</td>
                <td className="py-3 text-sm text-right">
                  <span
                    className={`inline-block px-2 rounded ${
                      page.exitRateStatus === "good"
                        ? "bg-green-100 text-green-800"
                        : page.exitRateStatus === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {page.exitRate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  