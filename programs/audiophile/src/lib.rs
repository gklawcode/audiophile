use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod audiophile {
    use super::*;

    pub fn upload_track(
        ctx: Context<UploadTrack>, 
        track_bump: u8, 
        cid: String, 
        title: String, 
        album_art_url: String
    ) -> ProgramResult {
        let track_account = &mut ctx.accounts.track;
        track_account.authority = track_account.key();
        track_account.bump = track_bump;
        track_account.cid = cid;
        track_account.title = title;
        track_account.album_art_url = album_art_url;
        Ok(())
    }
    
    pub fn update_track(
        ctx: Context<UpdateTrack>, 
        new_title: String, 
        new_album_art_url: String
    ) -> ProgramResult {
        let track_account = &mut ctx.accounts.track;
        track_account.title = new_title;
        track_account.album_art_url = new_album_art_url;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(track_bump: u8, cid: String)]
pub struct UploadTrack<'info> {
    #[account(
        init, 
        seeds = [
            user.key().as_ref(), 
            cid[..(cid.len()/2)].as_ref(), 
            cid[(cid.len()/2)..].as_ref()
            ], 
        bump = track_bump, 
        payer = user, 
        space = 8 + 300
    )]
    pub track: Account<'info, Track>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTrack<'info> {
    #[account(
        mut, 
        seeds = [
            authority.key().as_ref(), 
            track.cid[..(track.cid.len()/2)].as_ref(), 
            track.cid[(track.cid.len()/2)..].as_ref()
            ], 
        bump = track.bump)]
    pub track: Account<'info, Track>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Track {
    pub authority: Pubkey,
    pub bump: u8,
    pub cid: String,
    pub title: String,
    pub album_art_url: String,
}
