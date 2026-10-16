import Link from "next/link";
import Image from "next/image";
import heroImage from "../assets/hero2.jpg";
function Hero() {
    return (
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 md:pb-24 md:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                {/* Left side: the main marketing message */}
                <div className="lg:col-span-7">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta" />

                        <span className="font-body text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                            Kitchen to table · Addis Ababa
                        </span>
                    </div>

                    <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-heading sm:text-5xl md:text-6xl">
                        Delicious meals, delivered across Addis.
                    </h1>

                    <p className="mt-5 max-w-2xl font-body text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
                        No dull meals or long waiting. Fresh, flavorful dishes from
                        curated local kitchens and artisanal chefs delivered straight to
                        your door.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 font-body text-sm font-semibold text-white shadow-md transition hover:bg-cta-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
                        >
                            Order now

                            <span aria-hidden="true">→</span>
                        </Link>

                        <Link
                            href="/menu"
                            className="rounded-full bg-surface px-6 py-3 font-body text-sm font-semibold text-heading transition hover:bg-border focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2"
                        >
                            Browse menu
                        </Link>
                    </div>

                    {/* Stitch-style trust metrics */}
                    <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6 sm:gap-6">
                        <div>
                            <p className="font-display text-xl font-semibold text-heading sm:text-2xl">
                                06
                            </p>

                            <p className="mt-1 font-body text-xs text-muted">
                                Kitchens
                            </p>
                        </div>

                        <div>
                            <p className="font-display text-xl font-semibold text-heading sm:text-2xl">
                                32 min
                            </p>

                            <p className="mt-1 font-body text-xs text-muted">
                                Avg. delivery
                            </p>
                        </div>

                        <div>
                            <p className="font-display text-xl font-semibold text-heading sm:text-2xl">
                                4.9
                            </p>

                            <p className="mt-1 font-body text-xs text-muted">
                                Rating
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side: hero photography */}
                <div className="relative lg:col-span-5">
                    <div className="overflow-hidden rounded">
                        {/* The one LCP image: preloaded in <head>, and nothing else
                            on the site gets this. Static import = real width/height
                            (448x560) and a blur placeholder for free. sizes: ~5/12 of
                            the page on lg+, full width below. */}
                        <Image
                            src={heroImage}
                            alt="Fresh meal being prepared in a restaurant kitchen"
                            priority
                            placeholder="blur"
                            sizes="(min-width: 1024px) 40vw, 100vw"
                            className="aspect-4/3 w-full object-cover sm:aspect-4/5"
                        />
                    </div>

                    {/* Floating rating card */}
                    <div className="absolute bottom-4 left-4 rounded-2xl bg-card/90 px-4 py-3 shadow-lg backdrop-blur sm:bottom-6 sm:left-6">
                        <p className="font-body text-xs text-muted">
                            Customer rating
                        </p>

                        <p className="mt-1 font-body text-sm font-bold text-heading">
                            ★ 4.9 / 5
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;