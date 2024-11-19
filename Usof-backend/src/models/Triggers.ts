import { Sequelize } from 'sequelize';

export async function postRatingTrigger(sequelize: Sequelize) {
    const triggerSQL = `
        CREATE OR REPLACE FUNCTION update_post_rating()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE "Posts"
            SET rating = (
                SELECT 
                    COALESCE(SUM(CASE WHEN "type" = 'like' THEN 1 ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN "type" = 'dislike' THEN 1 ELSE 0 END), 0)
                FROM "Likes"
                WHERE "postId" = NEW."postId"
            )
            WHERE id = NEW."postId";

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_update_post_rating
        AFTER INSERT OR UPDATE OR DELETE ON "Likes"
        FOR EACH ROW
        EXECUTE FUNCTION update_post_rating();
    `;

    try {
        await sequelize.query(triggerSQL);
        console.log('Trigger created successfully.');
    } catch (error) {
        console.error('Error creating trigger:', error);
    }
}

export async function userRatingTrigger(sequelize: Sequelize) {
    const triggerSQL = `
    CREATE OR REPLACE FUNCTION update_user_rating()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE "Users"
        SET rating = (
            SELECT 
                COALESCE(SUM(CASE WHEN "status" = 'active' THEN "rating" ELSE 0 END), 0)
            FROM "Posts"
            WHERE "authorId" = NEW."authorId"
        )
        WHERE id = NEW."authorId";

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create the trigger for like changes
    CREATE TRIGGER trigger_update_user_rating
    AFTER INSERT OR UPDATE OR DELETE ON "Posts"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating();
    `;

    try {
        await sequelize.query(triggerSQL);
        console.log('Trigger created successfully.');
    } catch (error) {
        console.error('Error creating trigger:', error);
    }
}


