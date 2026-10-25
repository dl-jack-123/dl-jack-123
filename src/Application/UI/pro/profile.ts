export interface Profile {
    name: string;
    role: string;
    brand: string;
    tagline: string;
    summary: string;
    tags: string[];
    statsDate: string;
    stats: { label: string; value: string }[];
    skills: { [group: string]: string[] };
    projects: { title: string; desc: string; url: string; tech: string }[];
    links: { label: string; url: string }[];
}

/**
 * Single source of truth shared with DL-OS on the 3D monitor.
 * Relative URL so it resolves under the GitHub Pages sub-path.
 */
export const loadProfile = (): Promise<Profile> =>
    fetch('os/profile.json').then((r) => {
        if (!r.ok) throw new Error('profile.json ' + r.status);
        return r.json();
    });
