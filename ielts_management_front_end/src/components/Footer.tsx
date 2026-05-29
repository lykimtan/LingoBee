import Link from "next/link";

export const Footer = () => {
	return (
		<footer className="relative w-full overflow-hidden bg-[#141414] text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_50%)]" />
			<div className="absolute inset-y-0 right-0 w-[40%] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
			<div className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-24">
				<div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-start">
					<div className="space-y-8">
						<h2
							className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight"
							style={{ fontFamily: "'Instrument Serif', serif" }}
						>
							Reach Your Linguistic Dreams
						</h2>
						<div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="relative aspect-[4/5] overflow-hidden rounded-xl">
								<video
									className="h-full w-full object-cover"
									src="/videos/videoFooter.mp4"
									autoPlay
									muted
									loop
									playsInline
								/>
							</div>
							<p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60">
								@lingobee.edu
							</p>
						</div>

					</div>

					<div className="space-y-12">
						<div className="space-y-4">
							<p className="text-xs uppercase tracking-[0.4em] text-white/60">Nhan thong tin</p>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<input
									type="email"
									placeholder="Email address"
									className="h-11 w-full rounded-full border border-white/15 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
								/>
								<button className="h-11 rounded-full border border-white/30 px-5 text-xs uppercase tracking-[0.3em] text-white hover:border-white/70 transition">
									Subscribe
								</button>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-10 text-sm">
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.3em] text-white/60">Ho tro</p>
								<p className="text-white/70">support@lingobee.vn</p>
								<p className="text-white/70">Mo - Sau, 9:00 - 18:00</p>
							</div>
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.3em] text-white/60">Thong tin</p>
								<Link href="#" className="block text-white/70 hover:text-white">
									About Us
								</Link>
								<Link href="#" className="block text-white/70 hover:text-white">
									Tin tuc
								</Link>
							</div>
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.3em] text-white/60">Khóa học</p>
								<Link href="#" className="block text-white/70 hover:text-white">
									IELTS Academic
								</Link>
								<Link href="#" className="block text-white/70 hover:text-white">
									IELTS General
								</Link>
							</div>
							<div className="space-y-3">
								<p className="text-xs uppercase tracking-[0.3em] text-white/60">Dieu khoan</p>
								<Link href="#" className="block text-white/70 hover:text-white">
									Terms & Conditions
								</Link>
								<Link href="#" className="block text-white/70 hover:text-white">
									Privacy Policy
								</Link>
							</div>
							<button className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black hover:bg-white/90 transition">
								Liên hệ ngay
							</button>
						</div>
					</div>
				</div>

				<div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.3em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
					<span>© 2026 LingoBee</span>
					<span>All rights reserved</span>
				</div>
			</div>
		</footer>
	);
};
